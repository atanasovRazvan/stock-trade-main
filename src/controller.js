// Import necessary modules
const express = require('express');
const fetchHistoricalData = require('./data/historical');
const generateStockForecast = require('./data/forecast');
const { fetchRealTimeData } = require('./data/finnhub');

// Initialize Express application
const app = express();

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

// Forecast API: GET "/forecast"
app.get(`${baseURL}/forecast`, async (req, res) => {
    try {
        const data = generateStockForecast();
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

// Real-time API for SKX and NKE
app.get(`${baseURL}/real-time`, async (req, res) => {
    try {
        const data = await fetchRealTimeData(['SKX', 'NKE']);
        res.json({
            success: true,
            data,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch real-time data',
            error: error.message,
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

module.exports = app;
