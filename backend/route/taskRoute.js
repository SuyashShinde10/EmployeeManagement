const express = require('express');
const router = express.Router();
const { requireAuth, requirePM } = require('../middleware/requireAuth');

const {
  createTask, searchEmployees, assignTask, getTasks,
  updateTaskStatus, deleteTask, editTask, addComment, getTaskById,
  uploadAttachment, addSubtask, toggleSubtask
} = require('../controller/taskController');
const { upload } = require('../config/cloudinary');

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
router.post('/task/:id/subtask',      requirePM, addSubtask);

// ─── Shared Task Routes (Attachments and Subtasks) ─────────────────────────────
router.post('/task/:id/attachment',   upload.single('file'), uploadAttachment);
router.put('/task/:id/subtask/:subtaskId/toggle', toggleSubtask);

module.exports = router;