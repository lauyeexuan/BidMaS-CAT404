// server.js
const express = require('express');
const mongoose = require('mongoose');
const fileUpload = require('./middleware/fileUpload');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 4000;
const http = require('http');
const WebSocket = require('ws');

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('Client connected');
  
  // Send a welcome message
  ws.send(JSON.stringify({ type: 'connection', message: 'Connected to WebSocket server' }));
  
  // Handle incoming messages
  ws.on('message', (message) => {
    console.log('Received message:', message);
  });
  
  // Handle client disconnect
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Broadcast function to send messages to all connected clients
function broadcastMessage(type, data) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type, data }));
    }
  });
}

// Export the broadcast function for use in route handlers
module.exports.broadcastMessage = broadcastMessage;

const mongoDB = process.env.MONGODB_URI;

mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Allow requests from frontend dev server
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(fileUpload);

// Routes
const communityRoutes = require('./routes/community');
app.use('/api/community', communityRoutes);

// A simple route for testing
app.get('/', (req, res) => {
  res.send('BidMaS Express server is up and running!');
});

// Start the server
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});