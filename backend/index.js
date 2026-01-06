const express = require('express');
const cors = require('cors'); // Ensure you have this: npm install cors
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// --- 🛡️ BULLETPROOF CORS SETUP ---
// 1. Allow any origin ("*")
// 2. Disable credentials (cookies) to allow "*"
// 3. Handle the "Preflight" (OPTIONS) check explicitly
app.use(cors({
  origin: "*", 
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: false 
}));

// FORCE PREFLIGHT HANDLING
app.options("*", cors());
// ---------------------------------

app.use(express.json());

// Database
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ DB Connected'))
  .catch((err) => console.error('❌ DB Error:', err));

// Routes
app.use('/api', require('./routes/authRoutes')); 
app.use('/api', require('./routes/taskRoutes'));
app.use('/api', require('./routes/employeeRoutes'));

app.get("/", (req, res) => {
  res.json("Backend is working");
});

const PORT = process.env.PORT || 8000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
}

module.exports = app;