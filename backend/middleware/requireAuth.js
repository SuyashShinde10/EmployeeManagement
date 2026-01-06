const jwt = require('jsonwebtoken');
const User = require('../model/user');

const requireAuth = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: 'Authorization token required' });
  }

  // Token format: "Bearer <token>"
  const token = authorization.split(' ')[1];

  try {
    // IMPORTANT: Make sure this matches the secret in authController (createToken)
    const { _id } = jwt.verify(token, 'SECRET_KEY'); 

    req.user = await User.findOne({ _id }).select('_id companyId');
    next();
  } catch (error) {
    console.log("Auth Error:", error.message);
    res.status(401).json({ error: 'Request is not authorized' });
  }
};

module.exports = requireAuth;