// Import necessary modules
const app = require('./src/controller'); // Import the controller
const WebSocket = require('ws');

// Finnhub WebSocket URL and token
//FINNHUB_TOKEN = YOUR TOKEN HERE;

const FINNHUB_WS_URL = `wss://ws.finnhub.io?token=${FINNHUB_TOKEN}`;
const TARGET_SYMBOLS = ['NKE', 'SKX'];

// Server setup
const PORT = 3000;
const WS_PORT = 8000;

// Create a WebSocket Server (your own)
const wsServer = new WebSocket.Server({ port: WS_PORT });

// Store connected clients
const clients = new Set();

// Handle new client connections
wsServer.on('connection', (client) => {
    console.log('New client connected');
    clients.add(client);

    // Remove client on disconnection
    client.on('close', () => {
        console.log('Client disconnected');
        clients.delete(client);
    });
});

// Function to broadcast data to all connected clients
const broadcast = (data) => {
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
};

// Connect to Finnhub WebSocket
let finnhubSocket = new WebSocket(FINNHUB_WS_URL);

// Subscribe to the desired symbols
finnhubSocket.on('open', () => {
    console.log('Connected to Finnhub WebSocket');
    TARGET_SYMBOLS.forEach(symbol => {
        finnhubSocket.send(JSON.stringify({ type: 'subscribe', symbol }));
    });
});

// Listen for messages from Finnhub WebSocket
finnhubSocket.on('message', (message) => {
    const rawData = JSON.parse(message);

    if (rawData.type === 'trade' && rawData.data) {
        // Filter and transform the data
        const transformedData = rawData.data
            .filter(item => TARGET_SYMBOLS.includes(item.s)) // Filter for NKE and SKX
            .map(item => ({
                company: item.s === 'NKE' ? 'NIKE' : 'SKECHERS', // Company
                open: item.p,  // Trade open price (joke)
                timestamp: item.t // Timestamp
            }));

        // Forward the transformed data to connected clients
        if (transformedData.length > 0) {
            console.log('Forwarding data:', transformedData);
            broadcast(transformedData);
        }
    }
});

// Handle errors on Finnhub WebSocket
finnhubSocket.on('error', (error) => {
    console.error('Finnhub WebSocket error:', error);
});

// Reconnect Finnhub WebSocket on close
finnhubSocket.on('close', () => {
    console.log('Finnhub WebSocket closed. Reconnecting...');
    setTimeout(() => {
        finnhubSocket = new WebSocket(FINNHUB_WS_URL);
    }, 1000);
});

console.log('WebSocket server running on ws://localhost:8000');

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
