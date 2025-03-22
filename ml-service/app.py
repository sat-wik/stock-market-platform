from flask import Flask, jsonify, request
from models.stock_predictor import StockPredictor
from data.stock_data import StockDataFetcher
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
stock_predictor = StockPredictor()
stock_data_fetcher = StockDataFetcher()

@app.route('/predict/<symbol>', methods=['GET'])
def predict_stock(symbol):
    try:
        days = int(request.args.get('days', 7))
        historical_data = stock_data_fetcher.fetch_historical_data(symbol)
        predictions = stock_predictor.predict(historical_data, days)
        return jsonify({
            'symbol': symbol,
            'predictions': predictions.tolist(),
            'status': 'success'
        })
    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 400

@app.route('/analyze/<symbol>', methods=['GET'])
def analyze_stock(symbol):
    try:
        historical_data = stock_data_fetcher.fetch_historical_data(symbol)
        analysis = stock_predictor.analyze_trends(historical_data)
        return jsonify({
            'symbol': symbol,
            'analysis': analysis,
            'status': 'success'
        })
    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 400

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
