const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// --- 🔓 UNIVERSAL CORS FIX ---
app.use(cors({
  origin: "*",  // Allow ANY website to connect
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allow all actions
  allowedHeaders: ["Content-Type", "Authorization"] // Allow Tokens
}));
// -----------------------------

app.use(express.json());

// ... (Rest of your file remains exactly the same)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ DB Connected'))
  .catch((err) => console.error('❌ DB Error:', err));

app.use('/api', require('./routes/authRoutes')); 
app.use('/api', require('./routes/taskRoutes'));
app.use('/api', require('./routes/employeeRoutes'));

app.get("/", (req, res) => {
  res.json("TeamSync Backend is Running!");
});

module.exports = app;