import WebSocket from 'ws';
import { checkAlerts } from '../controllers/alertController.js';
import axios from 'axios';
import jwt from 'jsonwebtoken';

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;

if (!FINNHUB_API_KEY) {
    console.error('FINNHUB_API_KEY is not set in environment variables');
    process.exit(1);
}
const FINNHUB_WS_URL = `wss://ws.finnhub.io?token=${FINNHUB_API_KEY}`;

class StockService {
    constructor() {
        this.clients = new Set();
        this.stockData = new Map();
        this.subscribedSymbols = new Set();
        this.subscriptionQueue = [];
        this.isProcessingQueue = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.connect();
    }

    connect() {
        console.log('Connecting to Finnhub WebSocket API...');
        try {
            this.ws = new WebSocket(FINNHUB_WS_URL);

            this.ws.on('open', () => {
                console.log('Connected to Finnhub WebSocket');
                this.reconnectAttempts = 0; // Reset reconnect attempts on successful connection
                // Resubscribe to all symbols gradually
                this.subscribedSymbols.forEach(symbol => {
                    this.queueSubscription(symbol);
                });
                this.processSubscriptionQueue();
            });

            this.ws.on('message', async (data) => {
                const parsedData = JSON.parse(data);
                if (parsedData.type === 'trade') {
                    const { s: symbol, p: price, t: timestamp } = parsedData.data[0];
                    this.stockData.set(symbol, { price, timestamp });

                    // Check for triggered alerts
                    const triggeredAlerts = await checkAlerts(symbol, price);
                    
                    // If there are triggered alerts, include them in the broadcast
                    const message = {
                        type: 'price',
                        symbol,
                        price,
                        timestamp,
                        alerts: triggeredAlerts.map(alert => ({
                            id: alert.id,
                            userId: alert.userId,
                            targetPrice: alert.targetPrice,
                            condition: alert.condition
                        }))
                    };

                    this.broadcast(JSON.stringify(message));
                }
            });

            this.ws.on('close', () => {
                console.log('Disconnected from Finnhub WebSocket');
                setTimeout(() => this.connect(), 5000);
            });

            this.ws.on('error', (error) => {
                console.error('WebSocket error:', error);
                if (error.code === 429) {
                    console.log('Rate limit exceeded, implementing backoff strategy');
                    // Implement exponential backoff
                    const backoffDelay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
                    this.reconnectAttempts++;
                    setTimeout(() => this.connect(), backoffDelay);
                }
            });
        } catch (error) {
            console.error('Error connecting to WebSocket:', error);
            setTimeout(() => this.connect(), 5000);
        }


    }

    queueSubscription(symbol) {
        this.subscriptionQueue.push(symbol);
        if (!this.isProcessingQueue) {
            this.processSubscriptionQueue();
        }
    }

    async processSubscriptionQueue() {
        if (this.isProcessingQueue || this.subscriptionQueue.length === 0) {
            return;
        }

        this.isProcessingQueue = true;
        while (this.subscriptionQueue.length > 0) {
            const symbol = this.subscriptionQueue.shift();
            if (this.ws.readyState === WebSocket.OPEN) {
                try {
                    this.ws.send(JSON.stringify({ type: 'subscribe', symbol }));
                    this.subscribedSymbols.add(symbol);
                    // Add delay between subscriptions to avoid rate limiting
                    await new Promise(resolve => setTimeout(resolve, 500));
                } catch (error) {
                    console.error(`Error subscribing to ${symbol}:`, error);
                    // Put the symbol back in the queue if there was an error
                    this.subscriptionQueue.push(symbol);
                    break;
                }
            } else {
                // WebSocket not ready, put symbol back in queue
                this.subscriptionQueue.push(symbol);
                break;
            }
        }
        this.isProcessingQueue = false;

        // If there are remaining symbols and the WebSocket is open, continue processing
        if (this.subscriptionQueue.length > 0 && this.ws.readyState === WebSocket.OPEN) {
            setTimeout(() => this.processSubscriptionQueue(), 1000);
        }
    }

    subscribe(symbol) {
        if (!this.subscribedSymbols.has(symbol)) {
            this.queueSubscription(symbol);
        }
    }

    unsubscribe(symbol) {
        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type: 'unsubscribe', symbol }));
            this.subscribedSymbols.delete(symbol);
        }
    }

    async getStockQuote(symbol) {
        try {
            console.log(`Fetching quote for ${symbol} with API key: ${FINNHUB_API_KEY.substring(0, 5)}...`);
            const response = await axios.get(`https://finnhub.io/api/v1/quote`, {
                params: {
                    symbol,
                    token: FINNHUB_API_KEY
                },
                timeout: 5000 // 5 second timeout
            });

            console.log('Finnhub response for', symbol, ':', JSON.stringify(response.data, null, 2));

            // Check for API errors
            if (response.data.error) {
                console.error('Finnhub API error:', response.data.error);
            throw new Error(response.data.error);
            }

            // Validate the response data
            const { c: currentPrice, d: change, dp: percentChange, h: high, l: low, o: open, pc: previousClose } = response.data;

            if (currentPrice === 0 && open === 0 && previousClose === 0) {
                throw new Error(`No data available for symbol: ${symbol}`);
            }

            if (currentPrice === undefined || currentPrice === null) {
                console.error(`Invalid response data for symbol ${symbol}:`, response.data);
                throw new Error(`Invalid response data for symbol: ${symbol}`);
            }

            return {
                symbol,
                price: currentPrice,
                change,
                percentChange,
                high,
                low,
                open,
                previousClose,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error fetching stock quote:', {
                symbol,
                error: error.message,
                response: error.response?.data,
                stack: error.stack
            });

            if (error.response?.status === 429) {
                throw new Error('API rate limit exceeded. Please try again later.');
            }

            if (error.response?.status === 403) {
                throw new Error('API access denied. Please check API key configuration.');
            }

            if (error.code === 'ECONNABORTED') {
                throw new Error('Request timed out. Please try again.');
            }

            throw new Error(error.response?.data?.error || error.message || 'Failed to fetch stock quote');
        }
    }

    addClient(ws) {
        this.clients.add(ws);
        ws.isAlive = true;
        ws.isAuthenticated = false;
        ws.subscribedSymbols = new Set();

        // Send current stock data to the new client
        this.stockData.forEach((data, symbol) => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: 'price',
                    symbol,
                    ...data
                }));
            }
        });

        ws.on('pong', () => {
            ws.isAlive = true;
        });

        ws.on('close', () => this.removeClient(ws));
        ws.on('error', (error) => {
            console.error('Client WebSocket error:', error);
            this.removeClient(ws);
        });

        // Start heartbeat for this client
        const pingInterval = setInterval(() => {
            if (!ws.isAlive) {
                console.log('Client heartbeat failed, terminating connection');
                clearInterval(pingInterval);
                return ws.terminate();
            }
            ws.isAlive = false;
            ws.ping(() => {
                console.log('Ping sent to client');
            });
        }, 30000);

        // Store the interval ID for cleanup
        ws.pingInterval = pingInterval;
    }

    removeClient(ws) {
        // Unsubscribe from all symbols
        if (ws.subscribedSymbols) {
            ws.subscribedSymbols.forEach(symbol => {
                this.unsubscribe(symbol);
            });
        }

        // Clear heartbeat interval
        if (ws.pingInterval) {
            clearInterval(ws.pingInterval);
        }

        this.clients.delete(ws);
        console.log(`Client removed. Total clients: ${this.clients.size}`);
    }

    authenticateClient(ws, token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            ws.userId = decoded.id;
            ws.isAuthenticated = true;
            ws.send(JSON.stringify({
                type: 'auth',
                status: 'success',
                userId: decoded.id
            }));
            console.log(`Client authenticated: ${decoded.id}`);
        } catch (error) {
            console.error('WebSocket authentication error:', error);
            ws.send(JSON.stringify({
                type: 'auth',
                status: 'error',
                error: 'Invalid token'
            }));
        }
    }

    broadcast(data) {
        this.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });
    }
}

export default new StockService();
