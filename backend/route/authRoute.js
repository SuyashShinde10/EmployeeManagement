const express = require('express');
const router = express.Router();
const { requireAuth, requirePM } = require('../middleware/requireAuth');

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

// ─── PM-only Routes (requireAuth + requirePM) ─────────────────────────────────
router.post('/create-employee',     requireAuth, requirePM, createEmployee);
router.put('/employee/edit/:id',    requireAuth, requirePM, editEmployee);
router.put('/employee/delete/:id',  requireAuth, requirePM, deleteEmployee);

// ─── Authenticated User Routes ────────────────────────────────────────────────
// updateProfile uses req.user._id from token — the :id param is ignored for ownership
router.put('/user/profile/:id', requireAuth, updateProfile);

module.exports = router;