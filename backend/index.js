const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// On Vercel, env variables are injected automatically. 
// This check prevents the app from crashing if .env is missing.
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const app = express();

// 1. CORS MIDDLEWARE (Must be first)
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: false
}));

app.use(express.json());

// 2. DATABASE CONNECTION WITH ERROR HANDLING
const mongoURI = process.env.MONGO_URI;

// This prevents the "uri parameter must be a string" crash
if (!mongoURI) {
    console.error("❌ ERROR: MONGO_URI is undefined. Check Vercel Environment Variables.");
} else {
    mongoose.connect(mongoURI)
      .then(() => console.log('✅ DB Connected'))
      .catch((err) => console.error('❌ DB Connection Error:', err.message));
}

// 3. ROUTES
// Ensure these files exist in your 'routes' folder
app.use('/api', require('./routes/authRoutes')); 
app.use('/api', require('./routes/taskRoutes'));
app.use('/api', require('./routes/employeeRoutes'));

app.get("/", (req, res) => {
  res.json({ status: "Backend Online", database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected" });
});

// 4. EXPORT FOR VERCEL
module.exports = app;