const isDevelopment = process.env.NODE_ENV === 'development';
export const API_BASE_URL = isDevelopment ? 'http://localhost:3001' : 'https://past-crimson-primrose.glitch.me';
export const WS_BASE_URL = 'wss://past-crimson-primrose.glitch.me/ws';

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
