const jwt = require('jsonwebtoken');
const User = require('../model/user');

// ─── requireAuth ─────────────────────────────────────────────────────────────
// Verifies JWT and attaches req.user = { _id, companyId, role }
const requireAuth = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization token required.' });
  }

  const token = authorization.split(' ')[1];

  try {
    const { _id } = jwt.verify(token, process.env.JWT_SECRET);

    // Select only what downstream controllers need — never return password
    req.user = await User.findById(_id).select('_id companyId role status');

    if (!req.user || req.user.status === 'Resigned') {
      return res.status(401).json({ error: 'Account is inactive or not found.' });
    }

    next();
  } catch (error) {
    // Log server-side, return generic message to client
    console.error('[requireAuth]', error.message);
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

// ─── requirePM ───────────────────────────────────────────────────────────────
// Must be used AFTER requireAuth — blocks non-PM users
const requirePM = (req, res, next) => {
  if (!req.user || req.user.role !== 'PM') {
    return res.status(403).json({ error: 'Access restricted to Project Manager accounts.' });
  }
  next();
};

module.exports = { requireAuth, requirePM, requireHR: requirePM };