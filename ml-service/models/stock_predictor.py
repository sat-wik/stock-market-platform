import numpy as np
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
import pandas as pd

class StockPredictor:
    def __init__(self):
        self.model = None
        self.scaler = MinMaxScaler()
        self._build_model()

    def _build_model(self):
        self.model = Sequential([
            LSTM(50, return_sequences=True, input_shape=(60, 1)),
            LSTM(50, return_sequences=False),
            Dense(25),
            Dense(1)
        ])
        self.model.compile(optimizer='adam', loss='mean_squared_error')

    def _prepare_data(self, data, lookback=60):
        scaled_data = self.scaler.fit_transform(data.reshape(-1, 1))
        x_data, y_data = [], []
        
        for i in range(lookback, len(scaled_data)):
            x_data.append(scaled_data[i-lookback:i, 0])
            y_data.append(scaled_data[i, 0])
            
        return np.array(x_data), np.array(y_data)

    def predict(self, historical_data, prediction_days=7):
        # Prepare data
        close_prices = historical_data['Close'].values
        x_train, y_train = self._prepare_data(close_prices)
        
        # Train model
        self.model.fit(x_train, y_train, batch_size=32, epochs=20, verbose=0)
        
        # Prepare last 60 days for prediction
        last_60_days = close_prices[-60:]
        scaled_data = self.scaler.transform(last_60_days.reshape(-1, 1))
        x_test = np.array([scaled_data])
        
        # Make predictions
        predictions = []
        current_batch = scaled_data
        
        for _ in range(prediction_days):
            current_pred = self.model.predict(current_batch.reshape(1, 60, 1), verbose=0)
            predictions.append(current_pred[0, 0])
            current_batch = np.append(current_batch[1:], current_pred)
            
        return self.scaler.inverse_transform(np.array(predictions).reshape(-1, 1))

    def analyze_trends(self, historical_data):
        df = historical_data.copy()
        
        # Calculate technical indicators
        df['SMA_20'] = df['Close'].rolling(window=20).mean()
        df['SMA_50'] = df['Close'].rolling(window=50).mean()
        
        # Calculate RSI
        delta = df['Close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        rs = gain / loss
        df['RSI'] = 100 - (100 / (1 + rs))
        
        latest = df.iloc[-1]
        
        return {
            'trend': 'bullish' if latest['SMA_20'] > latest['SMA_50'] else 'bearish',
            'rsi': float(latest['RSI']),
            'sma_20': float(latest['SMA_20']),
            'sma_50': float(latest['SMA_50']),
            'current_price': float(latest['Close'])
        }
