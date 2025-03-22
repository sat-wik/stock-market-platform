import { WebSocket } from 'ws';

const clients = new Set();

export const setupWebSocket = (wss) => {
    wss.on('connection', (ws) => {
        clients.add(ws);
        console.log('New client connected');

        ws.on('message', (message) => {
            try {
                const data = JSON.parse(message);
                handleWebSocketMessage(ws, data);
            } catch (error) {
                console.error('Error processing message:', error);
            }
        });

        ws.on('close', () => {
            clients.delete(ws);
            console.log('Client disconnected');
        });
    });
};

const handleWebSocketMessage = (ws, data) => {
    switch (data.type) {
        case 'SUBSCRIBE_STOCK':
            handleStockSubscription(ws, data.symbol);
            break;
        case 'UNSUBSCRIBE_STOCK':
            handleStockUnsubscription(ws, data.symbol);
            break;
        default:
            console.log('Unknown message type:', data.type);
    }
};

const handleStockSubscription = (ws, symbol) => {
    // Add logic for stock subscription
    ws.subscribedStocks = ws.subscribedStocks || new Set();
    ws.subscribedStocks.add(symbol);
};

const handleStockUnsubscription = (ws, symbol) => {
    // Add logic for stock unsubscription
    if (ws.subscribedStocks) {
        ws.subscribedStocks.delete(symbol);
    }
};

export const broadcastStockUpdate = (symbol, data) => {
    clients.forEach((client) => {
        if (
            client.readyState === WebSocket.OPEN &&
            (!client.subscribedStocks || client.subscribedStocks.has(symbol))
        ) {
            client.send(JSON.stringify({
                type: 'STOCK_UPDATE',
                symbol,
                data
            }));
        }
    });
};
