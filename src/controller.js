// Import necessary modules
const express = require('express');
const generateStockData = require('./data/historical');
const generateStockForecast = require('./data/forecast');

// Initialize Express application
const app = express();

// Base URL
const baseURL = '/api';

// Historical API: GET "/historical"
app.get(`${baseURL}/history`, (req, res) => {
    try {
        const data = generateStockData();
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
app.get(`${baseURL}/forecast`, (req, res) => {
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

module.exports = app;
