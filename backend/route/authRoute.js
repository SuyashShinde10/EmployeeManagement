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

router.post('/register-company', registerCompany);
router.post('/login', login);
router.post('/create-employee', createEmployee);

// Employee Management Routes
router.put('/employee/edit/:id', editEmployee);
router.put('/employee/delete/:id', deleteEmployee);

// Profile Route
router.put('/user/profile/:id', updateProfile);

module.exports = router;