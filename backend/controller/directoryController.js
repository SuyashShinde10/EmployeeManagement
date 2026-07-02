const User = require('../model/user');

exports.getDirectory = async (req, res) => {
  try {
    const users = await User.find({ companyId: req.user.companyId })
      .select('-password -isPasswordTemp');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
