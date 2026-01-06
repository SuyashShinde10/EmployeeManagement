const Task = require('../model/task');
const User = require('../model/user');

// 1. Create Task
const createTask = async (req, res) => {
  try {
    const { title, description, companyId, deadline } = req.body;
    // Security: Ensure user belongs to this company
    if (req.user.companyId.toString() !== companyId) {
        return res.status(403).json({ error: "Unauthorized Company Access" });
    }
    const task = new Task({ title, description, companyId, deadline });
    const result = await task.save();
    res.status(201).json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ... (searchEmployees, assignTask remain similar, just ensure companyId matches req.user.companyId if you want extra security) ...
const searchEmployees = async (req, res) => {
    try {
      const { query, companyId, includeResigned } = req.query;
      // Security Check
      if (req.user.companyId.toString() !== companyId) {
         return res.status(403).json({ error: "Unauthorized" });
      }
      let filter = {
        companyId: companyId,
        role: 'Employee',
        $or: [
          { name: { $regex: query || "", $options: 'i' } },
          { team: { $regex: query || "", $options: 'i' } }
        ]
      };
      if (includeResigned !== 'true') filter.status = 'Active';
      const employees = await User.find(filter);
      res.json(employees);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const assignTask = async (req, res) => {
    try {
      const { taskId, employeeIds, companyId } = req.body;
      const updatedTask = await Task.findOneAndUpdate(
        { _id: taskId, companyId }, 
        { $addToSet: { assignedTo: { $each: employeeIds } }, status: "Assigned" },
        { new: true }
      ).populate('assignedTo');
      res.json(updatedTask);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const getTasks = async (req, res) => {
  try {
    const { companyId } = req.params;
    // Security Check
    if (req.user.companyId.toString() !== companyId) {
        return res.status(403).json({ error: "Unauthorized" });
    }
    const tasks = await Task.find({ companyId })
      .populate('assignedTo')
      .populate('completedBy'); 
    res.json(tasks);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// THE CRITICAL SECURITY FIX IS HERE
const updateTaskStatus = async (req, res) => {
  try {
    const { taskId, status } = req.body;
    
    // SECURE: Get ID from Token
    const userId = req.user._id; 

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // SECURE: Ensure user belongs to company
    if (task.companyId.toString() !== req.user.companyId.toString()) {
        return res.status(403).json({ message: "Unauthorized" });
    }

    let updateFields = {};

    if (status === 'In Progress') {
        updateFields.status = 'In Progress';
        if (!task.acceptedAt) updateFields.acceptedAt = new Date();
    } 
    else if (status === 'Completed') {
        const alreadyCompleted = task.completedBy.includes(userId);
        if (!alreadyCompleted) {
            await Task.findByIdAndUpdate(taskId, { $addToSet: { completedBy: userId } });
            
            // Check totals
            const updatedTaskCheck = await Task.findById(taskId);
            const totalAssigned = updatedTaskCheck.assignedTo.length;
            const totalCompleted = updatedTaskCheck.completedBy.length;

            if (totalCompleted >= totalAssigned) {
                updateFields.status = 'Completed';
                updateFields.completedAt = new Date();
            } else {
                return res.json(updatedTaskCheck);
            }
        }
    }

    const finalTask = await Task.findByIdAndUpdate(taskId, updateFields, { new: true })
        .populate('assignedTo').populate('completedBy');

    res.json(finalTask);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ... (deleteTask, editTask, addComment, getTaskById - Standard) ...
const deleteTask = async (req, res) => {
    try { await Task.findByIdAndDelete(req.params.id); res.json({ message: "Deleted" }); } 
    catch (err) { res.status(500).json({ error: err.message }); }
};
const editTask = async (req, res) => {
    try { 
        const { title, description, deadline } = req.body;
        const updatedTask = await Task.findByIdAndUpdate(req.params.id, { title, description, deadline }, { new: true });
        res.json(updatedTask); 
    } catch (err) { res.status(500).json({ error: err.message }); }
};
const addComment = async (req, res) => {
    try {
      const { taskId } = req.params;
      const { text } = req.body;
      const userId = req.user._id; // Secure ID from token
      const task = await Task.findByIdAndUpdate(taskId, { $push: { comments: { user: userId, text } } }, { new: true }).populate('comments.user', 'name'); 
      res.json(task);
    } catch (err) { res.status(500).json({ error: err.message }); }
};
const getTaskById = async (req, res) => {
    try {
      const task = await Task.findById(req.params.id).populate('assignedTo', 'name email').populate('completedBy', 'name').populate('comments.user', 'name');
      res.json(task);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

module.exports = { createTask, searchEmployees, assignTask, getTasks, updateTaskStatus, deleteTask, editTask, addComment, getTaskById };