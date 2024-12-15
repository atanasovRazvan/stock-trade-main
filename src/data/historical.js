const axios = require('axios');

async function fetchHistoricalData() {
    try {
        // URL of the Python service
        const response = await axios.get('http://localhost:5000/historical-data');

        // The data from the Python service
        const data = response.data;

        console.log('Historical Data retrieved:', data);

        // Use the data as needed
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

module.exports = fetchHistoricalData;


// const { faker } = require('@faker-js/faker');
// function generateStockData() {
//     const stockData = [];
//     const today = new Date();
//     const startDate = new Date();
//     startDate.setFullYear(today.getFullYear() - 1); // Start 1 year ago
//
//     let currentCoefficient = 100; // Starting value for stock coefficient
//
//     // Loop through each day from startDate to today
//     for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
//         const id = faker.string.uuid();
//         const timestamp = new Date(d).toISOString(); // Ensure new date object
//         const company = faker.helpers.arrayElement(["NIKE", "ADIDAS"]);
//
//         // Add some slight random fluctuation to the coefficient
//         currentCoefficient += faker.number.float({ min: -2, max: 3, precision: 0.01 });
//
//         stockData.push({
//             id,
//             timestamp,
//             company,
//             coefficient: parseFloat(currentCoefficient.toFixed(2)) // Round to 2 decimal places
//         });
//     }
//
//     // Ensure data is sorted by timestamp (just in case)
//     stockData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
//
//     return stockData;
// }
//
//
// console.log(JSON.stringify(stockData, null, 2));
// module.exports = generateStockData;
