import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta

class StockDataFetcher:
    def __init__(self):
        self.cache = {}
        self.cache_timeout = 300  # 5 minutes

    def fetch_historical_data(self, symbol, period='1y'):
        """
        Fetch historical data for a given stock symbol
        
        Args:
            symbol (str): Stock symbol (e.g., 'AAPL')
            period (str): Time period to fetch (default: '1y')
            
        Returns:
            pandas.DataFrame: Historical stock data
        """
        current_time = datetime.now()
        
        # Check cache
        if symbol in self.cache:
            cached_data, timestamp = self.cache[symbol]
            if (current_time - timestamp).seconds < self.cache_timeout:
                return cached_data

        try:
            stock = yf.Ticker(symbol)
            data = stock.history(period=period)
            
            if data.empty:
                raise ValueError(f"No data found for symbol {symbol}")
                
            # Cache the result
            self.cache[symbol] = (data, current_time)
            
            return data
            
        except Exception as e:
            raise Exception(f"Error fetching data for {symbol}: {str(e)}")

    def fetch_realtime_price(self, symbol):
        """
        Fetch real-time price for a given stock symbol
        
        Args:
            symbol (str): Stock symbol (e.g., 'AAPL')
            
        Returns:
            dict: Current stock price and related information
        """
        try:
            stock = yf.Ticker(symbol)
            info = stock.info
            
            return {
                'symbol': symbol,
                'price': info.get('regularMarketPrice'),
                'change': info.get('regularMarketChange'),
                'change_percent': info.get('regularMarketChangePercent'),
                'volume': info.get('regularMarketVolume'),
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            raise Exception(f"Error fetching real-time data for {symbol}: {str(e)}")
