# Installation and starting the server

### 1. Prerequisites
- Make sure you have `pip3`, `node` and `npm` installed 
- Make sure you can run python scripts
##
### 2. Package installation
- go to [scripts](src%2Fdata%2Fscripts) directory and run `pip3 install yfinance pandas datetime flask numpy tensorflow scikit-learn requests` to install python scripts dependencies
(there might be some difficulties with tensorflow, for me it worked to install tensorflow==2.10 for python3.10: python3 -m pip install --upgrade tensorflow==2.10)
- in project root, run `npm install` to install node server dependencies
- go to [stock-vizualisation](stock-vizualisation) directory and run `npm install` to install frontend dependencies
## 
### 3. Run and use the server
- run [historical_data_acqusition_yfinance.py](src%2Fdata%2Fscripts%2Fhistorical_data_acqusition_yfinance.py)
- run [lstm_forecast.py](src%2Fdata%2Fscripts%2Flstm_forecast.py)
- run node server by using `npm run start`
- get historical data with GET `http://localhost:3000/api/history`
- get forecasted data with GET `http://localhost:3000/api/forecast`
- listen to WebSocket for real-time data `ws://localhost:8000`
## 
### 4. Run and use the Frontend
- go to [stock-vizualisation](stock-vizualisation) directory and run `npm run start`
- go to `http://localhost:8080` and play around with the app
