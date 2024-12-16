const axios = require('axios');

const FINNHUB_API_KEY = 'ct9m1vpr01quh43od6sgct9m1vpr01quh43od6t0';
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

// Map Finnhub response fields to readable names
function mapFinnhubResponse(data) {
    return {
        symbol: data.symbol,
        currentPrice: data.c,       // 'c' -> current price
        priceChange: data.d,       // 'd' -> change in price
        percentChange: data.dp,    // 'dp' -> percentage change
        high: data.h,              // 'h' -> high price of the day
        low: data.l,               // 'l' -> low price of the day
        open: data.o,              // 'o' -> opening price
        previousClose: data.pc,    // 'pc' -> previous close price
        timestamp: data.t          // 't' -> timestamp
    };
}

// Fetch real-time stock data for multiple symbols
async function fetchRealTimeData(symbols) {
    try {
        const promises = symbols.map(async (symbol) => {
            const url = `${FINNHUB_BASE_URL}/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`;
            const response = await axios.get(url);
            const mappedData = mapFinnhubResponse({ symbol, ...response.data }); // Map fields
            return mappedData;
        });

        const results = await Promise.all(promises);
        return results; // Return an array of mapped results
    } catch (error) {
        console.error('Error fetching data from Finnhub:', error.message);
        throw error;
    }
}

module.exports = {
    fetchRealTimeData,
};