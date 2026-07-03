const cron = require('node-cron');
const Task = require('../model/task');
const Notification = require('../model/notification');

// Run every day at 00:00 (midnight)
cron.schedule('0 0 * * *', async () => {
  console.log('Running cron job: Checking for tasks with deadlines tomorrow...');
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

    // Find tasks that are not completed and deadline is between tomorrow and dayAfterTomorrow
    const tasks = await Task.find({
      status: { $ne: 'Completed' },
      deadline: {
        $gte: tomorrow,
        $lt: dayAfterTomorrow
      }
    }).populate('assignedTo');

    for (const task of tasks) {
      for (const user of task.assignedTo) {
        // Check if notification already exists to prevent duplicates
        const existingNotification = await Notification.findOne({
          user: user._id,
          type: 'Task Deadline',
          link: `/tasks/${task._id}`,
          isRead: false
        });

        if (!existingNotification) {
          const notification = new Notification({
            user: user._id,
            message: `Reminder: Task "${task.title}" is due tomorrow. 1 day remaining!`,
            type: 'Task Deadline',
            link: `/tasks/${task._id}`,
            companyId: task.companyId
          });
          await notification.save();
        }
      }
    }
    console.log(`Cron job finished. Found ${tasks.length} tasks due tomorrow.`);
  } catch (error) {
    console.error('Error in cron job:', error);
  }
});
