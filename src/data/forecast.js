const fs = require('fs');

function getForecastData() {
    try {
        const data = fs.readFileSync('./src/data/scripts/forecasted_data.json');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading forecasted data:', error.message);
        return [];
    }
}

module.exports = getForecastData;

