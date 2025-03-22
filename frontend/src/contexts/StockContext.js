import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { API_BASE_URL, ENDPOINTS, WS_BASE_URL } from '../config/api';

const StockContext = createContext();

export const useStock = () => {
    return useContext(StockContext);
};

export const StockProvider = ({ children }) => {
    const { token } = useAuth();
    const [watchlist, setWatchlist] = useState([]);
    const [stockData, setStockData] = useState({});
    const [loading, setLoading] = useState({});
    const [errors, setErrors] = useState({});
    const [ws, setWs] = useState(null);

    // Initialize WebSocket connection
    // Load watchlist on mount
    useEffect(() => {
        if (token) {
            loadWatchlist();
        }
    }, [token]);

    const loadWatchlist = async () => {
        try {
            setLoading(prev => ({ ...prev, watchlist: true }));
            setErrors(prev => ({ ...prev, watchlist: null }));

            const response = await axios.get(`${API_BASE_URL}${ENDPOINTS.STOCKS.WATCHLIST}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            setWatchlist(response.data.watchlist);

            // Load quotes for all watchlist stocks
            await Promise.all(response.data.watchlist.map(symbol => {
                subscribeToStock(symbol);
                return getStockQuote(symbol);
            }));
        } catch (error) {
            console.error('Error loading watchlist:', error);
            setErrors(prev => ({ ...prev, watchlist: 'Failed to load watchlist' }));
        } finally {
            setLoading(prev => ({ ...prev, watchlist: false }));
        }
    };

    useEffect(() => {
        let reconnectAttempts = 0;
        const maxReconnectAttempts = 5;
        let reconnectTimeout;

        const connectWebSocket = () => {
            console.log('Connecting to WebSocket...');
            const wsUrl = WS_BASE_URL;
            
            const socket = new WebSocket(wsUrl);

            socket.onopen = () => {
                console.log('WebSocket connected successfully');
                reconnectAttempts = 0;
                // Send authentication token if available
                if (token) {
                    socket.send(JSON.stringify({ type: 'auth', token }));
                }
            };
            
            socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log('WebSocket message received:', data);
                    if (data.type === 'price') {
                        setStockData(prev => ({
                            ...prev,
                            [data.symbol]: {
                                price: data.price,
                                timestamp: data.timestamp
                            }
                        }));
                    }
                } catch (error) {
                    console.error('Error processing WebSocket message:', error);
                }
            };

            socket.onerror = (error) => {
                console.error('WebSocket error:', error);
            };

            socket.onclose = (event) => {
                console.log('WebSocket closed:', event.code, event.reason);
                setWs(null);

                if (reconnectAttempts < maxReconnectAttempts) {
                    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000);
                    console.log(`Reconnecting in ${delay}ms... (Attempt ${reconnectAttempts + 1}/${maxReconnectAttempts})`);
                    reconnectTimeout = setTimeout(() => {
                        reconnectAttempts++;
                        connectWebSocket();
                    }, delay);
                } else {
                    console.error('Max reconnection attempts reached');
                }
            };

            setWs(socket);
        };

        connectWebSocket();

        return () => {
            if (ws) {
                ws.close();
            }
            if (reconnectTimeout) {
                clearTimeout(reconnectTimeout);
            }
        };
    }, [token]);

    // Configure axios with auth token
    useEffect(() => {
        // Add request interceptor
        const interceptor = axios.interceptors.request.use(
            (config) => {
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Remove interceptor on cleanup
        return () => {
            axios.interceptors.request.eject(interceptor);
        };
    }, [token]);

    const subscribeToStock = async (symbol) => {
        try {
            await axios.post(`${API_BASE_URL}/api/stocks/subscribe`, { symbol }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            console.error('Error subscribing to stock:', error);
        }
    };

    const unsubscribeFromStock = async (symbol) => {
        try {
            await axios.post(`${API_BASE_URL}/api/stocks/unsubscribe`, { symbol }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            console.error('Error unsubscribing from stock:', error);
        }
    };

    const getStockQuote = async (symbol) => {
        try {
            setLoading(prev => ({ ...prev, [symbol]: true }));
            setErrors(prev => ({ ...prev, [symbol]: null }));

            const response = await axios.get(`${API_BASE_URL}${ENDPOINTS.STOCKS.QUOTE(symbol)}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            setStockData(prev => ({
                ...prev,
                [symbol]: {
                    ...response.data,
                    lastUpdated: new Date().toISOString()
                }
            }));

            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Failed to fetch stock data';
            setErrors(prev => ({ ...prev, [symbol]: errorMessage }));
            throw error;
        } finally {
            setLoading(prev => ({ ...prev, [symbol]: false }));
        }
    };

    const updateWatchlist = async (symbol, action) => {
        try {
            setLoading(prev => ({ ...prev, [`watchlist_${symbol}`]: true }));
            setErrors(prev => ({ ...prev, [`watchlist_${symbol}`]: null }));

            const response = await axios.patch(`${API_BASE_URL}${ENDPOINTS.STOCKS.WATCHLIST}`, {
                symbol,
                action
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            setWatchlist(response.data.watchlist);
            
            if (action === 'add') {
                await subscribeToStock(symbol);
                // Get initial quote for the stock
                await getStockQuote(symbol);
            } else {
                await unsubscribeFromStock(symbol);
                // Remove stock data when removed from watchlist
                setStockData(prev => {
                    const newData = { ...prev };
                    delete newData[symbol];
                    return newData;
                });
            }

            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Failed to update watchlist';
            setErrors(prev => ({ ...prev, [`watchlist_${symbol}`]: errorMessage }));
            throw error;
        } finally {
            setLoading(prev => ({ ...prev, [`watchlist_${symbol}`]: false }));
        }
    };

    const value = {
        watchlist,
        stockData,
        loading,
        errors,
        subscribeToStock,
        unsubscribeFromStock,
        getStockQuote,
        updateWatchlist
    };

    return (
        <StockContext.Provider value={value}>
            {children}
        </StockContext.Provider>
    );
};
