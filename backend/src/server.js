import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';
import cors from 'cors';
import { initDatabase } from './models/index.js';
import setupAssociations from './models/associations.js';
import authRoutes from './routes/authRoutes.js';
import stockRoutes from './routes/stockRoutes.js';
import stockService from './services/stockService.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Create HTTP server
const server = createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ 
    server,
    path: '/ws',
    clientTracking: true
});

// WebSocket connection handler
wss.on('connection', (ws, req) => {
    const ip = req.socket.remoteAddress;
    console.log(`New WebSocket connection from ${ip}`);
    
    ws.isAlive = true;
    stockService.addClient(ws);

    // Send initial connection success message
    ws.send(JSON.stringify({ 
        type: 'connection', 
        status: 'success',
        timestamp: new Date().toISOString()
    }));

    ws.on('pong', () => {
        ws.isAlive = true;
    });

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message.toString());
            console.log('Received WebSocket message:', data);

            if (data.type === 'auth' && data.token) {
                // Handle authentication
                stockService.authenticateClient(ws, data.token);
            }
        } catch (error) {
            console.error('Error processing WebSocket message:', error);
            ws.send(JSON.stringify({ 
                type: 'error', 
                error: 'Invalid message format'
            }));
        }
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        stockService.removeClient(ws);
    });

    ws.on('close', (code, reason) => {
        console.log(`Client disconnected. Code: ${code}, Reason: ${reason}`);
        stockService.removeClient(ws);
    });
});

// CORS middleware
const allowedOrigins = [
    'https://stock-market-platform.vercel.app',
    'http://localhost:3000',
    'http://127.0.0.1:65033'
];

app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (process.env.NODE_ENV === 'development' || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 204,
    exposedHeaders: ['Access-Control-Allow-Origin']
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Request Body:', req.body);
    next();
});

// Test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working' });
});

// Set up model associations
setupAssociations();

// Auth routes
app.use('/api/auth', authRoutes);

// Stock routes
app.use('/api/stocks', stockRoutes);

// Debug logging for all requests
app.use((req, res, next) => {
    console.log(`[DEBUG] ${req.method} ${req.path}`);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    next();
});

// 404 handler
app.use((req, res) => {
    console.log(`[404] ${req.method} ${req.url} - Not Found`);
    res.status(404).json({ error: 'Not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    console.error('Stack:', err.stack);
    res.status(err.status || 500).json({
        error: err.message || 'Something went wrong!',
        path: req.url
    });
});

// Initialize database
await initDatabase();

// Start server
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
