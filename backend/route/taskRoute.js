const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth'); // Import Middleware

const { 
  createTask, searchEmployees, assignTask, getTasks, 
  updateTaskStatus, deleteTask, editTask, addComment, getTaskById
} = require('../controller/taskController');

// APPLY SECURITY MIDDLEWARE GLOBALLY TO ALL TASK ROUTES
router.use(requireAuth);

router.post('/task/create', createTask);
router.get('/employees/search', searchEmployees);
router.put('/task/assign', assignTask);
router.get('/tasks/:companyId', getTasks);
router.put('/task/status', updateTaskStatus);
router.delete('/task/:id', deleteTask);
router.put('/task/edit/:id', editTask);
router.get('/task/:id', getTaskById);
router.post('/task/comment/:taskId', addComment);

module.exports = router;