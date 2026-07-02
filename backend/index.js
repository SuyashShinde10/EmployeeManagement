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
const isOriginAllowed = (origin) => {
  if (!origin) return true; // Allow non-browser requests (Postman, mobile apps)
  
  // Allow localhost/127.0.0.1
  if (/^https?:\/\/localhost(:\d+)?$/.test(origin) || /^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)) {
    return true;
  }
  
  // Allow env-configured URL
  if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
    return true;
  }
  
  // Allow any deployment matching employee-management or teamsync on vercel.app
  const lowerOrigin = origin.toLowerCase();
  if (
    (lowerOrigin.includes('employee-management') || lowerOrigin.includes('employeemanagement') || lowerOrigin.includes('teamsync')) &&
    lowerOrigin.endsWith('.vercel.app')
  ) {
    return true;
  }
  
  return false;
};

app.use(cors({
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(null, false); // Reject silently so browser blocks it, without 500 error
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