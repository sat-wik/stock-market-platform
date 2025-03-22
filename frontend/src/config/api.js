export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
export const WS_BASE_URL = process.env.REACT_APP_API_URL 
    ? `wss://${process.env.REACT_APP_API_URL.replace('https://', '')}/ws`
    : 'ws://localhost:3001/ws';

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
  },
  STOCKS: {
    QUOTE: (symbol) => `/api/stocks/quote/${symbol}`,
    WATCHLIST: '/api/stocks/watchlist',
    ADD_TO_WATCHLIST: (symbol) => `/api/stocks/watchlist/${symbol}`,
    REMOVE_FROM_WATCHLIST: (symbol) => `/api/stocks/watchlist/${symbol}`,
  }
};
