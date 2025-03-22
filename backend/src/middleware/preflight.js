export const handlePreflight = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://stock-market-platform.vercel.app');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }
    
    next();
};
