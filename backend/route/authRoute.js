const express = require('express');
const router = express.Router();

const { 
  registerCompany, 
  login, 
  createEmployee,
  editEmployee,
  deleteEmployee,
  updateProfile
} = require('../controller/authController');

// Public Routes
router.post('/register-company', registerCompany);
router.post('/login', login);

// Note: Ensure your frontend sends the Token for these if you want them protected later
router.post('/create-employee', createEmployee); 
router.put('/employee/edit/:id', editEmployee);
router.put('/employee/delete/:id', deleteEmployee);
router.put('/user/profile/:id', updateProfile);

module.exports = router;