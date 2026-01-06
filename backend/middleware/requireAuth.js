const jwt = require('jsonwebtoken');
const User = require('../model/user');

const requireAuth = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: 'Authorization token required' });
  }

  // Token comes as "Bearer <token>"
  const token = authorization.split(' ')[1];

  try {
    // Verify token (Replace 'SECRET_KEY' with a real secret in .env for production)
    const { _id } = jwt.verify(token, 'SECRET_KEY');

    // Attach user to the request object
    req.user = await User.findOne({ _id }).select('_id companyId');
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ error: 'Request is not authorized' });
  }
};

module.exports = requireAuth;