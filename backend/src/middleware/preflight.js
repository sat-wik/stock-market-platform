const allowedOrigins = [
    'https://stock-market-platform.vercel.app',
    'http://localhost:3000',
    'http://127.0.0.1:65033'
];

export const handlePreflight = (req, res, next) => {
    const origin = req.headers.origin;
    
    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }
    
    next();
};
