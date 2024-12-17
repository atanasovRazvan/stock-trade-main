// Import necessary modules
const express = require('express');
const fetchHistoricalData = require('./data/historical');
const getForecastData = require('./data/forecast');

// Initialize Express application
const app = express();
const cors = require("cors");
app.use(cors());

// Base URL
const baseURL = '/api';

// Historical API: GET "/historical"
app.get(`${baseURL}/history`, async (req, res) => {
    try {
        // const data = generateHistoricalData();
        const data = await fetchHistoricalData();
        res.json({
            success: true,
            data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch historical data',
            error: error.message
        });
    }
});

// Playing with Grafana
app.get(`${baseURL}/combined`, async (req, res) => {
    try {
        const historicalData =  await fetchHistoricalData();
        const forecastedData = generateStockForecast();
        const combined = [
            ...historicalData.map(({timestamp, open, company}) =>
                ({timestamp, open, company, type: "history"})
            ),
            ...forecastedData.map(({timestamp, open, company}) =>
                ({timestamp, open, company, type: "forecast"})
            )
        ]
        res.json({
            success: true,
            data: combined,
        });
    } catch (error) {
    res.status(500).json({
        success: false,
        message: 'Failed to fetch forecast data',
        error: error.message
    });
}
})

// Forecast API: GET "/forecast"
app.get(`${baseURL}/forecast`, (req, res) => {
    try {
        const data = getForecastData();
        res.json({
            success: true,
            data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch forecast data',
            error: error.message
        });
    }
});

// Trigger LSTM forecast and update
app.get(`${baseURL}/forecast/update`, (req, res) => {
    exec('python3 src/data/scripts/lstm_forecast.py', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error running LSTM script: ${error.message}`);
            return res.status(500).json({
                success: false,
                message: 'Failed to update forecast data',
                error: error.message
            });
        }
        console.log('LSTM script output:', stdout);
        res.json({
            success: true,
            message: 'Forecast data updated successfully.'
        });
    });
});

module.exports = app;
