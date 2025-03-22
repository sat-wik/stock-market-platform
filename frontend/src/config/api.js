const VERCEL_URL = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
export const API_BASE_URL = VERCEL_URL;
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
