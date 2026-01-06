const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// --- UPDATE CORS ---
app.use(cors({
  origin: [
    "https://employee-management-six-chi.vercel.app", // Main Domain
    "https://employee-management-esq030mop-suyashshinde10s-projects.vercel.app" // The specific preview link you are on now
  ],
  methods: ["POST", "GET", "PUT", "DELETE"],
  credentials: true
}));
// -------------------

app.use(express.json());

// ... (Rest of the file stays the same)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ DB Connected'))
  .catch((err) => console.error('❌ DB Error:', err));

app.use('/api', require('./routes/authRoutes')); 
app.use('/api', require('./routes/taskRoutes'));
app.use('/api', require('./routes/employeeRoutes'));

app.get("/", (req, res) => {
  res.json("Hello");
});

module.exports = app;