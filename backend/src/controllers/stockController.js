import stockService from '../services/stockService.js';
import Watchlist from '../models/watchlist.js';
import User from '../models/user.js';

export const getStockQuote = async (req, res) => {
    try {
        const { symbol } = req.params;
        
        // Validate symbol format
        if (!symbol || typeof symbol !== 'string' || !symbol.match(/^[A-Z]{1,5}$/)) {
            return res.status(400).json({ error: 'Invalid stock symbol. Please use 1-5 uppercase letters.' });
        }

        const quote = await stockService.getStockQuote(symbol);
        if (!quote || !quote.price) {
            return res.status(404).json({ error: 'Stock symbol not found. Please verify the symbol.' });
        }

        res.json(quote);
    } catch (error) {
        console.error('Error fetching stock quote:', error);
        res.status(500).json({ error: 'Failed to fetch stock quote' });
    }
};

export const subscribeToStock = async (req, res) => {
    try {
        const { symbol } = req.body;
        stockService.subscribe(symbol);
        res.json({ message: 'Subscribed to stock updates' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to subscribe to stock updates' });
    }
};

export const unsubscribeFromStock = async (req, res) => {
    try {
        const { symbol } = req.body;
        stockService.unsubscribe(symbol);
        res.json({ message: 'Unsubscribed from stock updates' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to unsubscribe from stock updates' });
    }
};

export const updateWatchlist = async (req, res) => {
    try {
        console.log('Request body:', req.body);
        console.log('User:', req.user);
        const { symbol, action } = req.body;
        const userId = req.user.id;

        // Validate symbol format
        if (!symbol || typeof symbol !== 'string' || !symbol.match(/^[A-Z]{1,5}$/)) {
            return res.status(400).json({ error: 'Invalid stock symbol. Please use 1-5 uppercase letters.' });
        }

        // Validate action
        if (!['add', 'remove'].includes(action)) {
            return res.status(400).json({ error: 'Invalid action. Use "add" or "remove".' });
        }

        console.log('Attempting to', action, 'symbol:', symbol);
        if (action === 'add') {
            // Verify stock exists by attempting to get a quote
            try {
                const quote = await stockService.getStockQuote(symbol);
                if (!quote || !quote.price) {
                    return res.status(404).json({ error: 'Stock symbol not found. Please verify the symbol.' });
                }

                console.log('Stock quote verified, adding to watchlist...');
                // Add to watchlist
                const watchlistItem = await Watchlist.create({
                    userId,
                    symbol
                });

                console.log('Created watchlist item:', watchlistItem.toJSON());
                // Subscribe to real-time updates
                stockService.subscribe(symbol);
            } catch (error) {
                console.error('Error in add operation:', error);
                if (error.name === 'SequelizeUniqueConstraintError') {
                    return res.status(400).json({ error: 'Stock already in watchlist' });
                }
                throw error;
            }
        } else {
            // Remove from watchlist
            await Watchlist.destroy({
                where: {
                    userId,
                    symbol
                }
            });

            // Unsubscribe from real-time updates
            stockService.unsubscribe(symbol);
        }

        // Get updated watchlist
        const watchlistItems = await Watchlist.findAll({
            where: { userId },
            attributes: ['symbol']
        });

        const watchlist = watchlistItems.map(item => item.symbol);
        res.json({ watchlist });
    } catch (error) {
        console.error('Error updating watchlist:', error);
        res.status(500).json({ error: 'Failed to update watchlist' });
    }
};

export const getWatchlist = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get user's watchlist
        const watchlistItems = await Watchlist.findAll({
            where: { userId },
            attributes: ['symbol']
        });

        const watchlist = watchlistItems.map(item => item.symbol);
        res.json({ watchlist });
    } catch (error) {
        console.error('Error fetching watchlist:', error);
        res.status(500).json({ error: 'Failed to fetch watchlist' });
    }
};
