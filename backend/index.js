const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// On Vercel, env variables are injected automatically. 
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

// 2. DATABASE CONNECTION
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
    console.error("❌ ERROR: MONGO_URI is undefined. Check Vercel Environment Variables.");
} else {
    mongoose.connect(mongoURI)
      .then(() => console.log('✅ DB Connected')) // Your logs show this is now working!
      .catch((err) => console.error('❌ DB Connection Error:', err.message));
}

// 3. ROUTES 
// Updated to match your exact folder "route" and filenames from your screenshot
app.use('/api', require('./route/authRoute')); 
app.use('/api', require('./route/taskRoute'));

// If you have an employee route, ensure the filename matches exactly (e.g., employeeRoute.js)
app.use('/api', require('./route/employeeRoute')); 

app.get("/", (req, res) => {
  res.json({ 
    status: "Backend Online", 
    database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected" 
  });
});

// 4. EXPORT FOR VERCEL
module.exports = app;