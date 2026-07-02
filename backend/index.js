const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// ─── 1. Security Headers (Helmet) ────────────────────────────────────────────
app.use(helmet());

// ─── 2. CORS — Restrict to Known Frontend Origin ──────────────────────────────
const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL]
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (Postman, server-to-server) or whitelisted origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

// ─── 3. Body Parser ───────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' })); // Prevent oversized payloads

// ─── 4. Rate Limiting on Auth Routes ─────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,                   // max 20 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again in 15 minutes.' }
});

// ─── 5. Database Connection ───────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ DB Connected'))
  .catch((err) => {
    console.error('❌ DB Connection Error:', err.message);
    process.exit(1); // Fail fast if DB is unavailable
  });

// ─── 6. Routes ───────────────────────────────────────────────────────────────
// Apply rate limiting only to auth endpoints
app.use('/api', authLimiter, require('./route/authRoute'));
app.use('/api', require('./route/taskRoute'));

// ─── 7. Health Check ─────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'online', message: 'TeamSync API' });
});

// ─── 8. 404 Handler ──────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// ─── 9. Global Error Handler ──────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[GlobalError]', err);
  res.status(500).json({ error: 'An unexpected error occurred.' });
});

// ─── 10. Server Startup ───────────────────────────────────────────────────────
const PORT = process.env.PORT || 8000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;