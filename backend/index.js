const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// --- FIX STARTS HERE ---
app.use(cors({
  // 1. Replace "*" with your ACTUAL Frontend URL (No trailing slash)
  origin: ["https://employee-management-six-chi.vercel.app"], 
  methods: ["POST", "GET", "PUT", "DELETE"],
  credentials: true
}));
// --- FIX ENDS HERE ---

app.use(express.json());

// ... (Rest of your database connection and routes remains the same)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ DB Connected'))
  .catch((err) => console.error('❌ DB Error:', err));

app.use('/api', require('./routes/authRoutes')); 
app.use('/api', require('./routes/taskRoutes'));
app.use('/api', require('./routes/employeeRoutes'));

app.get("/", (req, res) => {
  res.json({ message: "TeamSync Backend is Running!" });
});

const PORT = process.env.PORT || 8000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
}

module.exports = app;