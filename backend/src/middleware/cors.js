export const corsMiddleware = (req, res, next) => {
    const allowedOrigins = [
        'http://localhost:3000',
        'http://127.0.0.1:65033',
        'https://stock-market-platform.vercel.app'
    ];

    const origin = req.headers.origin;
    
    // Set CORS headers
    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    } else {
        res.header('Access-Control-Allow-Origin', '*');
    }

    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    next();
};
