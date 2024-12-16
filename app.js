const app = require('./src/controller'); 
const WebSocket = require('ws');
const { fetchRealTimeData } = require('./src/data/finnhub');

const PORT = 3000;
const WS_PORT = 8080;

// Start the Express server
app.listen(PORT, () => {
    console.log(`HTTP server running at http://localhost:${PORT}`);
});

// Start the WebSocket server
const wsServer = new WebSocket.Server({ port: WS_PORT }, () => {
    console.log(`WebSocket server running at ws://localhost:${WS_PORT}`);
});

// Handle WebSocket connections
wsServer.on('connection', (ws) => {
    console.log('New client connected to WebSocket');

    // Periodically fetch real-time data for SKX and NKE and send it to the client
    const interval = setInterval(async () => {
        try {
            const data = await fetchRealTimeData(['SKX', 'NKE']);
            ws.send(JSON.stringify(data)); // Send the array of stock data
        } catch (error) {
            console.error('Error fetching real-time data for WebSocket:', error.message);
        }
    }, 5000); // Fetch every 5 seconds

    // Clear the interval when the client disconnects
    ws.on('close', () => {
        clearInterval(interval);
        console.log('Client disconnected');
    });
});