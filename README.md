# Installation and starting the server

### 1. Prerequisites
- Make sure you have `pip3`, `node` and `npm` installed 
- Make sure you can run python scripts
##
### 2. Package installation
- in [scripts](src%2Fdata2Fscripts) directory, run `pip3 install yfinance pandas datetime flask` to install python scripts dependencies
- in project root, run `npm install` to install node app dependencies
## 
### 3. Run and use the app
- run [historical_data_acqusition_yfinance.py](src%2Fdata%2Fscripts%2Fhistorical_data_acqusition_yfinance.py)
- run node server by using `npm run start`
- get historical data with GET `localhost:3000/api/history`
- get forecasted data with GET `localhost:3000/api/forecast`
- listen to WebSocket for real-time (TODO)
