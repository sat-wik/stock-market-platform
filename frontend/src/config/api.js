const isDevelopment = process.env.NODE_ENV === 'development';
export const API_BASE_URL = isDevelopment ? 'http://localhost:3001' : 'https://stock-market-platform-api.onrender.com';
export const WS_BASE_URL = isDevelopment ? 'ws://localhost:3001/ws' : 'wss://stock-market-platform-api.onrender.com/ws';

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
