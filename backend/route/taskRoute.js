const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth'); // Ensure this file exists

const { 
  createTask, searchEmployees, assignTask, getTasks, 
  updateTaskStatus, deleteTask, editTask, addComment, getTaskById
} = require('../controller/taskController');

// APPLY SECURITY MIDDLEWARE GLOBALLY TO ALL TASK ROUTES
// This means every route below requires a valid Token
router.use(requireAuth);

router.post('/task/create', createTask);
router.get('/employees/search', searchEmployees); // GET /api/employees/search
router.put('/task/assign', assignTask);
router.get('/tasks/:companyId', getTasks);        // GET /api/tasks/:companyId
router.put('/task/status', updateTaskStatus);
router.delete('/task/:id', deleteTask);
router.put('/task/edit/:id', editTask);
router.get('/task/:id', getTaskById);             // GET /api/task/:id
router.post('/task/comment/:taskId', addComment);

module.exports = router;