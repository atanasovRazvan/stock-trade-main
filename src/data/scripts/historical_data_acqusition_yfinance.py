import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
import json
from flask import Flask, jsonify

app = Flask(__name__)

tickers = ['SKX', 'NKE']
end_date = datetime.today().strftime('%Y-%m-%d')
start_date = (datetime.today() - timedelta(days=5*365)).strftime('%Y-%m-%d')

data = yf.download(tickers, start=start_date, end=end_date, group_by='ticker')

nke_df = data['NKE']
skx_df = data['SKX']

nke_df.reset_index(inplace=True)
skx_df.reset_index(inplace=True)

# Combine data into a JSON-friendly format
result = []
for index, row in nke_df.iterrows():
    result.append({
        'id': f"NKE-{index}",
        'timestamp': row['Date'].strftime('%Y-%m-%d'),
        'company': 'NIKE',
        'open': row['Open'] if 'Open' in row else None,
        'high': row['High'] if 'High' in row else None,
        'low': row['Low'] if 'Low' in row else None,
        'close': row['Close'] if 'Close' in row else None,
        'adj_close': row['Adj Close'] if 'Adj Close' in row else None,
        'volume': row['Volume'] if 'Volume' in row else None
    })

for index, row in skx_df.iterrows():
    result.append({
        'id': f"SKX-{index}",
        'timestamp': row['Date'].strftime('%Y-%m-%d'),
        'company': 'SKECHERS',
        'open': row['Open'] if 'Open' in row else None,
        'high': row['High'] if 'High' in row else None,
        'low': row['Low'] if 'Low' in row else None,
        'close': row['Close'] if 'Close' in row else None,
        'adj_close': row['Adj Close'] if 'Adj Close' in row else None,
        'volume': row['Volume'] if 'Volume' in row else None
    })

# Send data

@app.route('/historical-data', methods=['GET'])
def get_data():
    return jsonify(result)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
