const express = require('express');
const router = express.Router();
const { requireAuth, requireHR } = require('../middleware/requireAuth');

const {
  createTask, searchEmployees, assignTask, getTasks,
  updateTaskStatus, deleteTask, editTask, addComment, getTaskById
} = require('../controller/taskController');

// All task routes require a valid JWT
router.use(requireAuth);

// ─── Employee + HR Routes ─────────────────────────────────────────────────────
router.get('/employees/search',       searchEmployees);
router.get('/tasks/:companyId',       getTasks);
router.put('/task/status',            updateTaskStatus);
router.get('/task/:id',               getTaskById);
router.post('/task/comment/:taskId',  addComment);

// ─── HR-only Routes ───────────────────────────────────────────────────────────
router.post('/task/create',           requireHR, createTask);
router.put('/task/assign',            requireHR, assignTask);
router.delete('/task/:id',            requireHR, deleteTask);
router.put('/task/edit/:id',          requireHR, editTask);

module.exports = router;