import jwt from 'jsonwebtoken';
import User from '../models/user.js';

export const auth = async (req, res, next) => {
    try {
        console.log('Auth headers:', req.headers);
        const token = req.header('Authorization')?.replace('Bearer ', '');
        console.log('Token:', token ? `${token.substring(0, 10)}...` : 'No token');
        
        if (!token) {
            throw new Error('No authentication token provided');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded token:', decoded);
        console.log('Looking for user with ID:', decoded.id);
        const user = await User.findOne({ where: { id: decoded.id } });
        console.log('Found user:', user ? 'Yes' : 'No');

        if (!user) {
            throw new Error('User not found');
        }

        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        console.error('Auth error:', error.message);
        console.error('Full error:', error);
        res.status(401).json({ error: 'Please authenticate' });
    }
};
