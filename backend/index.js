require('dotenv').config();
const express = require('express');
const cors = require('cors'); // Import CORS
const app = express();

// Connect to Database
require('./config/db');

// Middleware
app.use(express.json()); // Parses incoming JSON requests
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // Allows React to talk to this Node server

// Import Routes
const authRoute = require('./route/authRoute');
const taskRoute = require('./route/taskRoute');

// Use Routes
app.use('/api', authRoute); // Prefix routes with /api
app.use('/api', taskRoute);

// Test Route
app.get('/', (req, res) => {
  res.send("TeamSync Server is Running...");
});

// Start Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});