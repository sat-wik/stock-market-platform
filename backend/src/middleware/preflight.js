const allowedOrigins = [
    'https://stock-market-platform.vercel.app',
    'http://localhost:3000',
    'http://127.0.0.1:65033'
];

export const handlePreflight = (req, res, next) => {
    const origin = req.headers?.origin || req.headers?.referer || '*';
    
    // In development, allow all origins
    if (process.env.NODE_ENV === 'development') {
        res.header('Access-Control-Allow-Origin', origin);
    } else if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    } else {
        res.header('Access-Control-Allow-Origin', 'https://stock-market-platform.vercel.app');
    }
    
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }
    
    next();
};
