const Task = require('../model/task');
const User = require('../model/user');

// Helper to calculate date range
const getStartDate = (range) => {
  const startDate = new Date();
  if (range === 'weekly') {
    startDate.setDate(startDate.getDate() - 7);
  } else if (range === 'annually') {
    startDate.setDate(startDate.getDate() - 365);
  } else {
    // Default to monthly (30 days)
    startDate.setDate(startDate.getDate() - 30);
  }
  return startDate;
};

// Helper to generate trend array
const generateTrendData = (tasks, range) => {
  const trend = [];
  const now = new Date();

  if (range === 'annually') {
    // Group by month name (last 12 months)
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = d.toLocaleString('default', { month: 'short' });
      const year = d.getFullYear();
      trend.push({ label: `${monthName} ${year}`, monthIndex: d.getMonth(), year, completed: 0, created: 0 });
    }

    tasks.forEach(t => {
      const cDate = new Date(t.createdAt);
      const cItem = trend.find(item => item.monthIndex === cDate.getMonth() && item.year === cDate.getFullYear());
      if (cItem) cItem.created++;

      if (t.completedAt) {
        const compDate = new Date(t.completedAt);
        const compItem = trend.find(item => item.monthIndex === compDate.getMonth() && item.year === compDate.getFullYear());
        if (compItem) compItem.completed++;
      }
    });
  } else {
    // Group by day (7 for weekly, 30 for monthly)
    const limit = range === 'weekly' ? 7 : 30;
    for (let i = limit - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dayLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      trend.push({ label: dayLabel, dateString: d.toDateString(), completed: 0, created: 0 });
    }

    tasks.forEach(t => {
      const createdStr = new Date(t.createdAt).toDateString();
      const cItem = trend.find(item => item.dateString === createdStr);
      if (cItem) cItem.created++;

      if (t.completedAt) {
        const compStr = new Date(t.completedAt).toDateString();
        const compItem = trend.find(item => item.dateString === compStr);
        if (compItem) compItem.completed++;
      }
    });
  }

  // Remove helper keys before sending to client
  return trend.map(({ label, completed, created }) => ({ label, completed, created }));
};

// ─── PM Analytics ────────────────────────────────────────────────────────────
exports.getPMAnalytics = async (req, res) => {
  try {
    const { range = 'monthly' } = req.query;
    const startDate = getStartDate(range);

    // Fetch tasks created or completed within range
    const tasks = await Task.find({
      companyId: req.user.companyId,
      $or: [
        { createdAt: { $gte: startDate } },
        { completedAt: { $gte: startDate } }
      ]
    }).populate('assignedTo', 'name email role');

    // 1. Task counters
    const totalTasks = tasks.length;
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const inProgress = tasks.filter(t => t.status === 'In Progress').length;
    const pending = tasks.filter(t => t.status === 'Pending' || t.status === 'Assigned').length;
    
    const overdue = tasks.filter(t => {
      const isDone = t.status === 'Completed';
      const deadlinePassed = new Date(t.deadline) < new Date();
      return !isDone && deadlinePassed;
    }).length;

    // 2. Trend chart data
    const trendData = generateTrendData(tasks, range);

    // 3. Employee Leaderboard calculations
    const employees = await User.find({
      companyId: req.user.companyId,
      role: 'Employee',
      status: { $ne: 'Resigned' }
    }).select('name email');

    const leaderboard = employees.map(emp => {
      // Tasks where this employee is assigned
      const assignedTasks = tasks.filter(t =>
        t.assignedTo.some(u => u._id.toString() === emp._id.toString())
      );

      // Tasks they marked complete
      const completedTasks = assignedTasks.filter(t =>
        t.completedBy.some(userId => userId.toString() === emp._id.toString())
      );

      // Calculate on-time completions
      let onTimeCount = 0;
      let totalSpeedMs = 0;

      completedTasks.forEach(t => {
        const history = t.memberHistory?.find(h => h.user.toString() === emp._id.toString());
        const accepted = history?.acceptedAt || t.createdAt;
        const completedDate = history?.completedAt || t.completedAt || new Date();

        if (new Date(completedDate) <= new Date(t.deadline)) {
          onTimeCount++;
        }
        totalSpeedMs += Math.max(0, new Date(completedDate) - new Date(accepted));
      });

      const avgSpeedHours = completedTasks.length > 0 
        ? parseFloat((totalSpeedMs / (1000 * 60 * 60) / completedTasks.length).toFixed(1))
        : 0;

      const avgSpeedDays = completedTasks.length > 0 
        ? parseFloat((totalSpeedMs / (1000 * 60 * 60 * 24) / completedTasks.length).toFixed(1))
        : 0;

      const onTimeRate = completedTasks.length > 0
        ? Math.round((onTimeCount / completedTasks.length) * 100)
        : 0;

      // Simple scoring formula (out of 100)
      // 40% total completed task ratio, 30% on time rate, 30% speed component (under 3 days gets max)
      const completionRatio = assignedTasks.length > 0 ? (completedTasks.length / assignedTasks.length) : 0;
      const speedScore = avgSpeedDays <= 1 ? 30 : (avgSpeedDays <= 3 ? 20 : (avgSpeedDays <= 7 ? 10 : 0));
      const score = Math.round((completionRatio * 40) + (onTimeRate * 0.3) + speedScore);

      const assignedIndividualCount = assignedTasks.filter(t => t.assignedTo.length <= 1).length;
      const assignedTeamCount = assignedTasks.filter(t => t.assignedTo.length > 1).length;

      const completedIndividualCount = completedTasks.filter(t => t.assignedTo.length <= 1).length;
      const completedTeamCount = completedTasks.filter(t => t.assignedTo.length > 1).length;

      return {
        _id: emp._id,
        name: emp.name,
        email: emp.email,
        assignedCount: assignedTasks.length,
        completedCount: completedTasks.length,
        assignedIndividualCount,
        assignedTeamCount,
        completedIndividualCount,
        completedTeamCount,
        onTimeRate,
        avgSpeedDays,
        avgSpeedHours,
        score
      };
    });

    // Sort leaderboard by score descending, then by completion count descending
    leaderboard.sort((a, b) => b.score - a.score || b.completedCount - a.completedCount);

    res.json({
      summary: {
        totalTasks,
        completed,
        inProgress,
        pending,
        overdue
      },
      trend: trendData,
      leaderboard
    });
  } catch (error) {
    console.error('[getPMAnalytics] Error:', error);
    res.status(500).json({ error: 'Server error retrieving PM analytics.' });
  }
};

// ─── Employee Individual Analytics ───────────────────────────────────────────
exports.getEmployeeAnalytics = async (req, res) => {
  try {
    const { range = 'monthly' } = req.query;
    const userId = req.user._id;
    const startDate = getStartDate(range);

    // Fetch tasks where employee is assigned (either created or completed in window)
    const tasks = await Task.find({
      companyId: req.user.companyId,
      assignedTo: userId,
      $or: [
        { createdAt: { $gte: startDate } },
        { completedAt: { $gte: startDate } }
      ]
    });

    // 1. Task counters
    const totalAssigned = tasks.length;
    const completedCount = tasks.filter(t =>
      t.completedBy.some(id => id.toString() === userId.toString())
    ).length;
    const workingCount = tasks.filter(t =>
      t.acceptedBy.some(id => id.toString() === userId.toString()) &&
      !t.completedBy.some(id => id.toString() === userId.toString())
    ).length;
    const pendingCount = totalAssigned - completedCount - workingCount;

    // 2. On-Time & Speed
    let onTimeCount = 0;
    let totalSpeedMs = 0;

    const completedTasks = tasks.filter(t =>
      t.completedBy.some(id => id.toString() === userId.toString())
    );

    completedTasks.forEach(t => {
      const history = t.memberHistory?.find(h => h.user.toString() === userId.toString());
      const accepted = history?.acceptedAt || t.createdAt;
      const completedDate = history?.completedAt || t.completedAt || new Date();

      if (new Date(completedDate) <= new Date(t.deadline)) {
        onTimeCount++;
      }
      totalSpeedMs += Math.max(0, new Date(completedDate) - new Date(accepted));
    });

    const avgSpeedHours = completedTasks.length > 0
      ? parseFloat((totalSpeedMs / (1000 * 60 * 60) / completedTasks.length).toFixed(1))
      : 0;

    const avgSpeedDays = completedTasks.length > 0 
      ? parseFloat((totalSpeedMs / (1000 * 60 * 60 * 24) / completedTasks.length).toFixed(1))
      : 0;

    const onTimeRate = completedTasks.length > 0
      ? Math.round((onTimeCount / completedTasks.length) * 100)
      : 0;

    // 3. Trend Data (personalized for this employee's completions)
    const personalTrend = generateTrendData(completedTasks, range);

    // 4. Generate dynamic, high-value personal insights comparing to a previous window
    let insight = "Keep completing your assigned tasks on schedule to build up your overall productivity scores.";
    
    // Fetch previous window tasks to compare speed
    const prevStartDate = new Date(startDate);
    if (range === 'weekly') {
      prevStartDate.setDate(prevStartDate.getDate() - 7);
    } else if (range === 'annually') {
      prevStartDate.setDate(prevStartDate.getDate() - 365);
    } else {
      prevStartDate.setDate(prevStartDate.getDate() - 30);
    }

    const prevTasks = await Task.find({
      companyId: req.user.companyId,
      assignedTo: userId,
      $or: [
        { createdAt: { $gte: prevStartDate, $lt: startDate } },
        { completedAt: { $gte: prevStartDate, $lt: startDate } }
      ]
    });

    const prevCompletedTasks = prevTasks.filter(t =>
      t.completedBy.some(id => id.toString() === userId.toString())
    );

    if (completedCount > prevCompletedTasks.length && prevCompletedTasks.length > 0) {
      const increasePct = Math.round(((completedCount - prevCompletedTasks.length) / prevCompletedTasks.length) * 100);
      insight = `Excellent! You completed ${increasePct}% more tasks in this period compared to the previous timeframe.`;
    } else if (onTimeRate >= 90) {
      insight = `Outstanding! Your on-time completion rate is sitting at a perfect ${onTimeRate}%. PMs value this reliability.`;
    } else if (avgSpeedDays > 0 && avgSpeedDays <= 2) {
      insight = `Fast delivery! You're completing assigned tasks in an average of ${avgSpeedDays} days. Keep it up!`;
    }

    res.json({
      summary: {
        totalAssigned,
        completedCount,
        workingCount,
        pendingCount,
        onTimeRate,
        avgSpeedDays,
        avgSpeedHours
      },
      trend: personalTrend,
      insight
    });
  } catch (error) {
    console.error('[getEmployeeAnalytics] Error:', error);
    res.status(500).json({ error: 'Server error retrieving employee analytics.' });
  }
};
