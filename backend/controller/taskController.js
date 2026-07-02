const Task = require('../model/task');
const User = require('../model/user');
const logActivity = require('../utils/logger');

// ─── 1. Create Task ───────────────────────────────────────────────────────────
const createTask = async (req, res) => {
  try {
    const { title, description, companyId, deadline } = req.body;

    if (!title || !companyId || !deadline) {
      return res.status(400).json({ error: 'Title, companyId, and deadline are required.' });
    }

    if (req.user.companyId.toString() !== companyId) {
      return res.status(403).json({ error: 'Unauthorized company access.' });
    }

    const task = new Task({ title, description, companyId, deadline });
    const result = await task.save();

    const populatedTask = await Task.findById(result._id)
      .populate('assignedTo', 'name email team')
      .populate('completedBy', 'name')
      .populate('acceptedBy', 'name');

    const io = req.app.get('socketio');
    if (io) {
      io.to(companyId.toString()).emit('task_created', populatedTask);
    }

    await logActivity(req.user.id, companyId, 'Created Task', `Task: ${title}`);

    res.status(201).json(populatedTask);
  } catch (err) {
    console.error('[createTask]', err);
    res.status(500).json({ error: 'Failed to create task.' });
  }
};

// ─── 2. Search Employees ──────────────────────────────────────────────────────
const searchEmployees = async (req, res) => {
  try {
    const { query, companyId, includeResigned } = req.query;

    if (req.user.companyId.toString() !== companyId) {
      return res.status(403).json({ error: 'Unauthorized.' });
    }

    let filter = {
      companyId,
      role: 'Employee',
      $or: [
        { name: { $regex: query || '', $options: 'i' } },
        { team: { $regex: query || '', $options: 'i' } }
      ]
    };

    if (includeResigned !== 'true') filter.status = 'Active';

    const employees = await User.find(filter).select('-password');
    res.json(employees);
  } catch (err) {
    console.error('[searchEmployees]', err);
    res.status(500).json({ error: 'Search failed.' });
  }
};

// ─── 3. Assign Task ───────────────────────────────────────────────────────────
const assignTask = async (req, res) => {
  try {
    const { taskId, employeeIds } = req.body;
    const companyId = req.user.companyId; // Always use server-side companyId

    if (!taskId || !employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0) {
      return res.status(400).json({ error: 'taskId and employeeIds are required.' });
    }

    const task = await Task.findOne({ _id: taskId, companyId });
    if (!task) {
      return res.status(404).json({ error: 'Task not found or unauthorized.' });
    }

    const newEmployeeIds = employeeIds.filter(id => !task.assignedTo.some(currId => currId.toString() === id.toString()));
    if (newEmployeeIds.length === 0) {
      return res.status(400).json({ error: 'Selected employees are already assigned to this task.' });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { $addToSet: { assignedTo: { $each: newEmployeeIds } }, status: 'Assigned' },
      { new: true }
    ).populate('assignedTo', 'name email team')
     .populate('completedBy', 'name')
     .populate('acceptedBy', 'name');

    if (!updatedTask) {
      return res.status(404).json({ error: 'Task not found or unauthorized.' });
    }

    const io = req.app.get('socketio');
    if (io) {
      io.to(companyId.toString()).emit('task_updated', updatedTask);
    }

    res.json(updatedTask);
  } catch (err) {
    console.error('[assignTask]', err);
    res.status(500).json({ error: 'Assignment failed.' });
  }
};

// ─── 4. Get All Tasks for Company ─────────────────────────────────────────────
const getTasks = async (req, res) => {
  try {
    const { companyId } = req.params;

    if (req.user.companyId.toString() !== companyId) {
      return res.status(403).json({ error: 'Unauthorized.' });
    }

    const tasks = await Task.find({ companyId })
      .populate('assignedTo', 'name email team')
      .populate('completedBy', 'name')
      .populate('acceptedBy', 'name');

    res.json(tasks);
  } catch (err) {
    console.error('[getTasks]', err);
    res.status(500).json({ error: 'Failed to fetch tasks.' });
  }
};

// ─── 5. Update Task Status ────────────────────────────────────────────────────
const updateTaskStatus = async (req, res) => {
  try {
    const { taskId, status } = req.body;
    const userId = req.user._id;

    if (!taskId || !status) {
      return res.status(400).json({ error: 'taskId and status are required.' });
    }

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    if (task.companyId.toString() !== req.user.companyId.toString()) {
      return res.status(403).json({ message: 'Unauthorized.' });
    }

    let updateFields = {};

    if (status === 'In Progress') {
      await Task.findByIdAndUpdate(taskId, { $addToSet: { acceptedBy: userId } });
      
      const taskCheck = await Task.findById(taskId);
      const historyIndex = taskCheck.memberHistory?.findIndex(h => h.user.toString() === userId.toString());
      if (historyIndex === -1 || historyIndex === undefined) {
        await Task.findByIdAndUpdate(taskId, {
          $push: { memberHistory: { user: userId, acceptedAt: new Date() } }
        });
      } else {
        await Task.updateOne(
          { _id: taskId, 'memberHistory.user': userId },
          { $set: { 'memberHistory.$.acceptedAt': new Date() } }
        );
      }

      updateFields.status = 'In Progress';
      if (!task.acceptedAt) updateFields.acceptedAt = new Date();
    } else if (status === 'Completed') {
      const alreadyCompleted = task.completedBy.some(id => id.toString() === userId.toString());
      if (!alreadyCompleted) {
        // Also ensure user is in acceptedBy when completing, for status consistency
        await Task.findByIdAndUpdate(taskId, { 
          $addToSet: { 
            completedBy: userId,
            acceptedBy: userId
          } 
        });

        // Set completedAt in memberHistory (and acceptedAt if missing)
        const taskCheck = await Task.findById(taskId);
        const historyItem = taskCheck.memberHistory?.find(h => h.user.toString() === userId.toString());
        if (!historyItem) {
          await Task.findByIdAndUpdate(taskId, {
            $push: { memberHistory: { user: userId, acceptedAt: new Date(), completedAt: new Date() } }
          });
        } else {
          await Task.updateOne(
            { _id: taskId, 'memberHistory.user': userId },
            { 
              $set: { 
                'memberHistory.$.completedAt': new Date(),
                'memberHistory.$.acceptedAt': historyItem.acceptedAt || new Date()
              } 
            }
          );
        }

        const updatedTaskCheck = await Task.findById(taskId)
          .populate('assignedTo', 'name email team')
          .populate('completedBy', 'name')
          .populate('acceptedBy', 'name');

        const totalAssigned = updatedTaskCheck.assignedTo.length;
        const totalCompleted = updatedTaskCheck.completedBy.length;

        if (totalCompleted >= totalAssigned) {
          updateFields.status = 'Completed';
          updateFields.completedAt = new Date();
        } else {
          const io = req.app.get('socketio');
          if (io) {
            io.to(task.companyId.toString()).emit('task_updated', updatedTaskCheck);
          }
          return res.json(updatedTaskCheck);
        }
      }
    }

    const finalTask = await Task.findByIdAndUpdate(taskId, updateFields, { new: true })
      .populate('assignedTo', 'name email team')
      .populate('completedBy', 'name')
      .populate('acceptedBy', 'name');

    const io = req.app.get('socketio');
    if (io) {
      io.to(task.companyId.toString()).emit('task_updated', finalTask);
    }

    res.json(finalTask);
  } catch (err) {
    console.error('[updateTaskStatus]', err);
    res.status(500).json({ error: 'Status update failed.' });
  }
};

// ─── 6. Delete Task (HR only, enforced via route) ─────────────────────────────
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, companyId: req.user.companyId });
    if (!task) {
      return res.status(404).json({ error: 'Task not found or unauthorized.' });
    }
    await Task.findByIdAndDelete(req.params.id);

    const io = req.app.get('socketio');
    if (io) {
      io.to(task.companyId.toString()).emit('task_deleted', req.params.id);
    }

    res.json({ message: 'Task deleted.' });
  } catch (err) {
    console.error('[deleteTask]', err);
    res.status(500).json({ error: 'Delete failed.' });
  }
};

// ─── 7. Edit Task (HR only, enforced via route) ───────────────────────────────
const editTask = async (req, res) => {
  try {
    const { title, description, deadline } = req.body;

    const task = await Task.findOne({ _id: req.params.id, companyId: req.user.companyId });
    if (!task) {
      return res.status(404).json({ error: 'Task not found or unauthorized.' });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, deadline },
      { new: true }
    ).populate('assignedTo', 'name email team')
     .populate('completedBy', 'name')
     .populate('acceptedBy', 'name');

    const io = req.app.get('socketio');
    if (io) {
      io.to(task.companyId.toString()).emit('task_updated', updatedTask);
    }

    res.json(updatedTask);
  } catch (err) {
    console.error('[editTask]', err);
    res.status(500).json({ error: 'Edit failed.' });
  }
};

// ─── 8. Add Comment ───────────────────────────────────────────────────────────
const addComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Comment text is required.' });
    }

    const task = await Task.findOne({ _id: taskId, companyId: req.user.companyId });
    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { $push: { comments: { user: userId, text: text.trim() } } },
      { new: true }
    ).populate('comments.user', 'name')
     .populate('assignedTo', 'name email team')
     .populate('completedBy', 'name')
     .populate('acceptedBy', 'name');

    const io = req.app.get('socketio');
    if (io) {
      io.to(task.companyId.toString()).emit('task_updated', updatedTask);
    }

    res.json(updatedTask);
  } catch (err) {
    console.error('[addComment]', err);
    res.status(500).json({ error: 'Failed to post comment.' });
  }
};

// ─── 9. Get Task By ID ────────────────────────────────────────────────────────
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, companyId: req.user.companyId })
      .populate('assignedTo', 'name email team')
      .populate('completedBy', 'name')
      .populate('acceptedBy', 'name')
      .populate('comments.user', 'name');

    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    res.json(task);
  } catch (err) {
    console.error('[getTaskById]', err);
    res.status(500).json({ error: 'Failed to fetch task.' });
  }
};

// ─── 10. File Attachments ───────────────────────────────────────────────────────
const uploadAttachment = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findOne({ _id: id, companyId: req.user.companyId });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const attachment = {
      public_id: req.file.filename,
      url: req.file.path,
      filename: req.file.originalname
    };

    task.attachments.push(attachment);
    await task.save();

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── 11. Subtasks ─────────────────────────────────────────────────────────────
const addSubtask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    
    if (req.user.role !== 'PM') return res.status(403).json({ error: 'Only PMs can add subtasks' });

    const task = await Task.findOneAndUpdate(
      { _id: id, companyId: req.user.companyId },
      { $push: { subtasks: { title } } },
      { new: true }
    );
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const toggleSubtask = async (req, res) => {
  try {
    const { id, subtaskId } = req.params;
    
    const task = await Task.findOne({ _id: id, companyId: req.user.companyId });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    
    const subtask = task.subtasks.id(subtaskId);
    if (!subtask) return res.status(404).json({ error: 'Subtask not found' });
    
    subtask.isCompleted = !subtask.isCompleted;
    await task.save();
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createTask, searchEmployees, assignTask, getTasks,
  updateTaskStatus, deleteTask, editTask, addComment, getTaskById,
  uploadAttachment, addSubtask, toggleSubtask
};