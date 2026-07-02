const express = require('express');
const router = express.Router();
const { requireAuth, requireHR } = require('../middleware/requireAuth');

const {
  registerCompany,
  login,
  createEmployee,
  editEmployee,
  deleteEmployee,
  updateProfile
} = require('../controller/authController');

// ─── Public Routes ────────────────────────────────────────────────────────────
router.post('/register-company', registerCompany);
router.post('/login', login);

// ─── HR-only Routes (requireAuth + requireHR) ─────────────────────────────────
router.post('/create-employee',     requireAuth, requireHR, createEmployee);
router.put('/employee/edit/:id',    requireAuth, requireHR, editEmployee);
router.put('/employee/delete/:id',  requireAuth, requireHR, deleteEmployee);

// ─── Authenticated User Routes ────────────────────────────────────────────────
// updateProfile uses req.user._id from token — the :id param is ignored for ownership
router.put('/user/profile/:id', requireAuth, updateProfile);

module.exports = router;