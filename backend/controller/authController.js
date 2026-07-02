const crypto = require('crypto');
const Company = require('../model/company');
const User = require('../model/user');
const jwt = require('jsonwebtoken');

// ─── Helper: create JWT ──────────────────────────────────────────────────────
const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.JWT_SECRET, { expiresIn: '3d' });
};

// ─── Helper: generate a strong random password ───────────────────────────────
// Format: 12 chars, mix of upper/lower/digits/special — e.g. "Ax#9mKq!2Rz5"
const generatePassword = () => {
  const upper  = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower  = 'abcdefghjkmnpqrstuvwxyz';
  const digits = '23456789';
  const special = '!@#$%&*';
  const all = upper + lower + digits + special;

  const getRand = (chars) => chars[crypto.randomInt(0, chars.length)];

  // Guarantee at least one of each character type
  const required = [
    getRand(upper),
    getRand(lower),
    getRand(digits),
    getRand(special),
  ];

  const rest = Array.from({ length: 8 }, () => getRand(all));
  const password = [...required, ...rest]
    .sort(() => crypto.randomInt(0, 2) - 0.5) // shuffle
    .join('');

  return password;
};

// ─── 1. REGISTER COMPANY ─────────────────────────────────────────────────────
const registerCompany = async (req, res) => {
  try {
    const { companyName, hrName, email, password } = req.body;

    if (!companyName || !hrName || !email || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered.' });
    }

    const newCompany = new Company({ name: companyName });
    const savedCompany = await newCompany.save();

    const hrUser = new User({
      name: hrName,
      email,
      password,         // pre-save hook will hash this
      role: 'HR',
      companyId: savedCompany._id,
      status: 'Active'
    });

    await hrUser.save();
    res.status(201).json({ message: 'Company registered successfully.' });
  } catch (err) {
    console.error('[registerCompany]', err);
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Company name or email already exists.' });
    }
    res.status(500).json({ error: err.message || 'Registration failed. Please try again.' });
  }
};

// ─── 2. CREATE EMPLOYEE (random password, hashed via schema hook) ─────────────
const createEmployee = async (req, res) => {
  try {
    const { name, email, team, hrCompanyId } = req.body;

    if (!name || !email || !hrCompanyId) {
      return res.status(400).json({ error: 'Name, email, and company are required.' });
    }

    // Verify HR's company matches the submitted company
    if (req.user.companyId.toString() !== hrCompanyId) {
      return res.status(403).json({ error: 'Unauthorized company access.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const generatedPassword = generatePassword();

    const newEmployee = new User({
      name,
      email,
      password: generatedPassword, // schema hook will hash it
      role: 'Employee',
      companyId: hrCompanyId,
      team: team || 'General',
      status: 'Active'
    });

    await newEmployee.save();

    // Return the plain-text password ONCE — HR must share it with the employee
    res.status(201).json({
      message: 'Employee created successfully.',
      generatedPassword // ⚠️ Only returned once — not stored in plain text
    });
  } catch (err) {
    console.error('[createEmployee]', err);
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Email already registered.' });
    }
    res.status(500).json({ error: 'Failed to create employee. Please try again.' });
  }
};

// ─── 3. LOGIN ────────────────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });

    // Constant-time-like response: don't reveal whether email exists
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    if (user.status === 'Resigned') {
      return res.status(403).json({ message: 'Account deactivated. Contact your HR.' });
    }

    const token = createToken(user._id);

    res.json({
      success: true,
      token,
      userId: user._id,
      name: user.name,
      role: user.role,
      companyId: user.companyId
    });
  } catch (err) {
    console.error('[login]', err);
    res.status(500).json({ message: err.message || 'Login failed. Please try again.' });
  }
};

// ─── 4. EDIT EMPLOYEE (HR only, enforced via route) ──────────────────────────
const editEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, team } = req.body;

    // Ensure the target employee belongs to HR's company
    const employee = await User.findOne({ _id: id, companyId: req.user.companyId });
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found.' });
    }

    await User.findByIdAndUpdate(id, { name, email, team });
    res.json({ message: 'Employee updated.' });
  } catch (err) {
    console.error('[editEmployee]', err);
    res.status(500).json({ error: 'Update failed. Please try again.' });
  }
};

// ─── 5. DELETE EMPLOYEE (soft delete → Resigned) ─────────────────────────────
const deleteEmployee = async (req, res) => {
  try {
    const employee = await User.findOne({ _id: req.params.id, companyId: req.user.companyId });
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found.' });
    }
    await User.findByIdAndUpdate(req.params.id, { status: 'Resigned' });
    res.json({ message: 'Employee archived.' });
  } catch (err) {
    console.error('[deleteEmployee]', err);
    res.status(500).json({ error: 'Operation failed. Please try again.' });
  }
};

// ─── 6. UPDATE OWN PROFILE ───────────────────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    // Use ID from the verified token — ignore any :id in URL
    const userId = req.user._id;
    const { name, password } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters.' });
    }

    const updateData = { name: name.trim() };

    if (password) {
      if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters.' });
      }
      updateData.password = password; // schema pre-update hook hashes it
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).select('-password');
    res.json({ message: 'Profile updated.', user: updatedUser });
  } catch (err) {
    console.error('[updateProfile]', err);
    res.status(500).json({ error: 'Update failed. Please try again.' });
  }
};

module.exports = { registerCompany, createEmployee, login, editEmployee, deleteEmployee, updateProfile };