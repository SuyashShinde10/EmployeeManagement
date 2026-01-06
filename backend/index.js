const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// 1. CORS CONFIGURATION
app.use(cors({
  origin: "*", // Allow all origins for development
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: false
}));

app.use(express.json());

// 2. DATABASE CONNECTION
const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI)
  .then(() => console.log('✅ DB Connected Successfully'))
  .catch((err) => console.error('❌ DB Connection Error:', err.message));

// 3. ROUTES
// Ensure these files exist in a 'route' folder
app.use('/api', require('./route/authRoute')); 
app.use('/api', require('./route/taskRoute'));

// Test Route
app.get("/", (req, res) => {
  res.json({ status: "Backend Online", message: "Welcome to the API" });
});

// 4. SERVER STARTUP (The Missing Piece!)
// This allows the app to run locally on port 8000 AND export for Vercel
const PORT = process.env.PORT || 8000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running locally on http://localhost:${PORT}`);
  });
}

module.exports = app;