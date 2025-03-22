import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import User from '../models/user.js';
import sequelize from '../models/index.js';



export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({
            where: {
                [Op.or]: [{ email }, { username }]
            }
        });

        if (existingUser) {

            return res.status(400).json({
                error: 'User with this email or username already exists'
            });
        }

        // Create new user
        const user = await User.create({
            username,
            email,
            password
        });

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );


        res.status(201).json({
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                watchlist: user.watchlist
            },
            token
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt:', { email });

        // Find user by email
        const user = await User.findOne({ where: { email } });
        console.log('User found:', { userId: user?.id });

        if (!user) {
            console.log('User not found');

            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Validate password
        const isValidPassword = await user.validatePassword(password);
        console.log('Password validation:', { isValid: isValidPassword });

        if (!isValidPassword) {
            console.log('Invalid password');

            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        const response = {
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                watchlist: user.watchlist
            },
            token
        };

        console.log('Login successful:', { userId: user.id });

        res.json(response);
    } catch (error) {
        console.error('Login error:', error);
        res.status(400).json({ error: error.message });
    }
};

export const getProfile = async (req, res) => {
    try {
        res.json({
            user: {
                id: req.user.id,
                username: req.user.username,
                email: req.user.email,
                watchlist: req.user.watchlist
            }
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const updateWatchlist = async (req, res) => {
    try {
        const { symbol, action } = req.body;
        const user = req.user;

        if (action === 'add') {
            if (!user.watchlist.includes(symbol)) {
                user.watchlist = [...user.watchlist, symbol];
            }
        } else if (action === 'remove') {
            user.watchlist = user.watchlist.filter(s => s !== symbol);
        }

        await user.save();

        res.json({ watchlist: user.watchlist });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
