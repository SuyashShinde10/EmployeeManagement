const Company = require('../model/company');
const User = require('../model/user');
const jwt = require('jsonwebtoken');

// Helper to create token
const createToken = (_id) => {
  return jwt.sign({ _id }, 'SECRET_KEY', { expiresIn: '3d' });
};

// 1. REGISTER COMPANY
const registerCompany = async (req, res) => {
  try {
    const { companyName, hrName, email, password } = req.body;
    const newCompany = new Company({ name: companyName });
    const savedCompany = await newCompany.save();

    const hrUser = new User({
      name: hrName, email, password, role: 'HR',
      companyId: savedCompany._id, status: 'Active'
    });
    
    await hrUser.save();
    res.status(201).json({ message: "Company Registered!" });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// 2. CREATE EMPLOYEE
const createEmployee = async (req, res) => {
  try {
    const { name, email, password, team, hrCompanyId } = req.body;
    const newEmployee = new User({
      name, email, password, role: 'Employee',
      companyId: hrCompanyId, team, status: 'Active'
    });
    await newEmployee.save();
    res.status(201).json({ message: "Employee Created" });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// 3. LOGIN (NOW RETURNS TOKEN)
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }
    
    if (user.status === 'Resigned') {
      return res.status(403).json({ message: "Access Denied" });
    }

    // Generate Token
    const token = createToken(user._id);

    res.json({ 
      success: true, 
      token, // <--- SEND TOKEN
      userId: user._id, 
      name: user.name,
      role: user.role, 
      companyId: user.companyId 
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// 4. EDIT EMPLOYEE
const editEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, team } = req.body;
    await User.findByIdAndUpdate(id, { name, email, team });
    res.json({ message: "Updated" });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// 5. DELETE EMPLOYEE
const deleteEmployee = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { status: 'Resigned' });
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// 6. UPDATE PROFILE
const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, password } = req.body;
    const updateData = { name };
    if (password) updateData.password = password; 
    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });
    res.json({ message: "Updated", user: updatedUser });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

module.exports = { registerCompany, createEmployee, login, editEmployee, deleteEmployee, updateProfile };