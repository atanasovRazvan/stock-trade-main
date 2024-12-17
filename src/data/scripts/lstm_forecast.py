import pandas as pd
import numpy as np
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from sklearn.preprocessing import MinMaxScaler
import json
import requests

# Fetch historical data from your existing historical API
response = requests.get("http://localhost:3000/api/history")
historical_data = response.json()['data']

# Process data for NIKE and SKECHERS
def prepare_data(company, historical_data):
    df = pd.DataFrame([x for x in historical_data if x['company'] == company])
    df = df[['timestamp', 'open']].sort_values('timestamp')
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    df = df.set_index('timestamp')
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled_data = scaler.fit_transform(df[['open']])
    return df, scaled_data, scaler

# Sequence generator
def create_sequences(data, seq_length):
    x, y = [], []
    for i in range(len(data) - seq_length):
        x.append(data[i:i + seq_length])
        y.append(data[i + seq_length])
    return np.array(x), np.array(y)

# Build LSTM model
def build_lstm_model(input_shape):
    model = Sequential([
        LSTM(50, return_sequences=True, input_shape=input_shape),
        Dropout(0.2),
        LSTM(50, return_sequences=False),
        Dropout(0.2),
        Dense(25),
        Dense(1)
    ])
    model.compile(optimizer='adam', loss='mean_squared_error')
    return model

# Forecast function
def forecast_stock(company, historical_data, seq_length=60, future_days=60):
    df, scaled_data, scaler = prepare_data(company, historical_data)
    x, _ = create_sequences(scaled_data, seq_length)
    model = build_lstm_model((x.shape[1], x.shape[2]))
    model.fit(x, x[:, -1, 0], epochs=10, batch_size=32, verbose=1)
    
    # Forecast
    predictions = []
    current_sequence = scaled_data[-seq_length:].tolist()
    for _ in range(future_days):
        next_step = model.predict(np.array([current_sequence]), verbose=0)
        predictions.append(next_step[0, 0])
        current_sequence.append([next_step[0, 0]])
        current_sequence.pop(0)

    # Inverse scale predictions
    forecast_dates = pd.date_range(df.index[-1] + pd.Timedelta(days=1), periods=future_days)
    forecasted_prices = scaler.inverse_transform(np.array(predictions).reshape(-1, 1))
    forecast = [{'timestamp': str(forecast_dates[i]), 'company': company, 'open': float(forecasted_prices[i][0])} for i in range(future_days)]
    return forecast

# Run forecasts
nike_forecast = forecast_stock('NIKE', historical_data)
skechers_forecast = forecast_stock('SKECHERS', historical_data)

# Combine results and save to forecasted_data.json in the project root
with open('./forecasted_data.json', 'w') as f:
    json.dump(nike_forecast + skechers_forecast, f)

print("Forecast saved to forecasted_data.json")
