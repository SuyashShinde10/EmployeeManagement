const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// 1. ALLOW CORS FROM ANYWHERE (Crucial for Vercel deployment)
app.use(cors({
  origin: "*", 
  credentials: true
}));

app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ DB Connected'))
  .catch((err) => console.error('❌ DB Error:', err));

// Routes
// (Make sure your route paths match what you have)
app.use('/api', require('./routes/authRoutes')); 
app.use('/api', require('./routes/taskRoutes'));
app.use('/api', require('./routes/employeeRoutes'));

app.get("/", (req, res) => {
  res.json({ message: "TeamSync Backend is Running on Vercel!" });
});

// 2. EXPORT FOR VERCEL (Instead of just listening)
const PORT = process.env.PORT || 8000;

if (require.main === module) {
  // Only listen if running locally
  app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
}

module.exports = app;