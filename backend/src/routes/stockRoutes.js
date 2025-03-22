import express from 'express';
import { auth } from '../middleware/auth.js';
import {
    getStockQuote,
    subscribeToStock,
    unsubscribeFromStock,
    updateWatchlist,
    getWatchlist
} from '../controllers/stockController.js';

const router = express.Router();

router.get('/quote/:symbol', auth, getStockQuote);
router.post('/subscribe', auth, subscribeToStock);
router.post('/unsubscribe', auth, unsubscribeFromStock);
router.get('/watchlist', auth, getWatchlist);
router.patch('/watchlist', auth, updateWatchlist);

export default router;
