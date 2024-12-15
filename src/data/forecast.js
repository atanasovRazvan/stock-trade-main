const { faker } = require('@faker-js/faker'); // Correct way to import faker

function generateStockForecast() {
    const forecastData = [];
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    let currentCoefficient = 100; // Starting value for forecast coefficient

    for (let d = new Date(today); d <= nextWeek; d.setDate(d.getDate() + 1)) {
        const id = faker.string.uuid(); // Correct usage of Faker's UUID generation
        const timestamp = d.toISOString();
        const company = faker.helpers.arrayElement(["NIKE", "SKECHERS"]); // Correct usage for random selection

        // Add some slight random fluctuation to the coefficient
        currentCoefficient += faker.number.float({ min: -2, max: 3, precision: 0.01 });

        forecastData.push({
            id,
            timestamp,
            company,
            open: parseFloat(currentCoefficient.toFixed(2)) // Round to 2 decimal places
        });
    }

    // Ensure data is sorted by timestamp (just in case)
    forecastData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    return forecastData;
}

const forecastData = generateStockForecast();
module.exports = generateStockForecast;
