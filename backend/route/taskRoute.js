const express = require('express');
const router = express.Router();
const { requireAuth, requirePM } = require('../middleware/requireAuth');

const {
  createTask, searchEmployees, assignTask, getTasks,
  updateTaskStatus, deleteTask, editTask, addComment, getTaskById
} = require('../controller/taskController');

// All task routes require a valid JWT
router.use(requireAuth);

// ─── Employee + PM Routes ─────────────────────────────────────────────────────
router.get('/employees/search',       searchEmployees);
router.get('/tasks/:companyId',       getTasks);
router.put('/task/status',            updateTaskStatus);
router.get('/task/:id',               getTaskById);
router.post('/task/comment/:taskId',  addComment);

// ─── PM-only Routes ───────────────────────────────────────────────────────────
router.post('/task/create',           requirePM, createTask);
router.put('/task/assign',            requirePM, assignTask);
router.delete('/task/:id',            requirePM, deleteTask);
router.put('/task/edit/:id',          requirePM, editTask);

module.exports = router;