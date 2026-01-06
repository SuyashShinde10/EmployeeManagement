const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// 1. CORS MIDDLEWARE (Must be first)
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: false
}));

app.use(express.json());

// 2. FORCE OK on OPTIONS requests (Preflight)
app.options('*', (req, res) => {
  res.sendStatus(200);
});

// ... Database and Routes ...
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ DB Connected'))
  .catch((err) => console.error('❌ DB Error:', err));

app.use('/api', require('./routes/authRoutes')); 
app.use('/api', require('./routes/taskRoutes'));
app.use('/api', require('./routes/employeeRoutes'));

app.get("/", (req, res) => {
  res.json("Backend Online");
});

module.exports = app;