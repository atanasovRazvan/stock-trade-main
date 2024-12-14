// Import necessary modules
const app = require('./src/controller'); // Import the controller

// Server setup
const PORT = 3000;
const WS_PORT = 8080;

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
