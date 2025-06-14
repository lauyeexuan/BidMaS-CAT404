// server.js
const express = require('express');
const mongoose = require('mongoose');
const fileUpload = require('./middleware/fileUpload');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 4000;

const mongoDB = process.env.MONGODB_URI;

mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://bidmas.vercel.app'
  ],
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

// For Vercel, we need to export the app
module.exports = app;

// Only listen if not running on Vercel
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}