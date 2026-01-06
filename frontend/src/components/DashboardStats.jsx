import React from 'react';

const DashboardStats = ({ tasks = [] }) => {
  // 1. GLOBAL STATS
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'Completed').length;
  const inProgress = tasks.filter(t => t.status === 'In Progress').length;
  const pending = tasks.filter(t => t.status === 'Pending' || t.status === 'Assigned').length;

  // 2. TEAM BREAKDOWN
  const teams = ['General', 'Frontend', 'Backend', 'QA', 'Marketing'];
  const teamStats = {};
  teams.forEach(team => {
    teamStats[team] = { total: 0, pending: 0, inProgress: 0, completed: 0 };
  });
  teamStats['Unassigned'] = { total: 0, pending: 0, inProgress: 0, completed: 0 };

  tasks.forEach(task => {
    let teamName = 'Unassigned';
    if (task.assignedTo && task.assignedTo.length > 0) {
      const userTeam = task.assignedTo[0].team;
      if (teams.includes(userTeam)) teamName = userTeam;
      else teamName = 'General';
    }
    teamStats[teamName].total++;
    if (task.status === 'Completed') teamStats[teamName].completed++;
    else if (task.status === 'In Progress') teamStats[teamName].inProgress++;
    else teamStats[teamName].pending++;
  });

  return (
    <div className="mb-4">
      {/* SECTION 1: METRIC CARDS */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Tasks', value: total, color: 'primary', icon: '📂' },
          { label: 'In Progress', value: inProgress, color: 'warning', icon: '🔥' },
          { label: 'Completed', value: completed, color: 'success', icon: '✅' },
          { label: 'Pending', value: pending, color: 'secondary', icon: '⏳' },
        ].map((stat, index) => (
          <div className="col-md-3" key={index}>
            <div className="card border-0 shadow-sm h-100" style={{borderRadius: '12px'}}>
              <div className="card-body d-flex align-items-center justify-content-between p-4">
                <div>
                   <h6 className="text-muted text-uppercase small fw-bold mb-1">{stat.label}</h6>
                   <h2 className={`mb-0 fw-bold text-${stat.color}`}>{stat.value}</h2>
                </div>
                <div className={`bg-${stat.color} bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center`} style={{width: '50px', height: '50px', fontSize: '1.5rem'}}>
                   {stat.icon}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* SECTION 2: TEAM TABLE */}
      <div className="card border-0 shadow-sm" style={{borderRadius: '12px', overflow: 'hidden'}}>
        <div className="card-header bg-white py-3 border-0">
          <h6 className="mb-0 fw-bold text-dark">Team Performance</h6>
        </div>
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead className="bg-light text-secondary">
              <tr className="small text-uppercase">
                <th className="ps-4 py-3 fw-bold">Department</th>
                <th className="fw-bold">Total</th>
                <th className="fw-bold">Pending</th>
                <th className="fw-bold">In Progress</th>
                <th className="fw-bold">Done</th>
                <th className="fw-bold">Health</th>
              </tr>
            </thead>
            <tbody>
              {[...teams, 'Unassigned'].map((team) => {
                if (team === 'Unassigned' && teamStats[team].total === 0) return null;
                const stats = teamStats[team];
                // Simple calculation for a "Health Bar"
                const progress = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

                return (
                  <tr key={team} style={{borderBottom: '1px solid #f0f0f0'}}>
                    <td className="ps-4 fw-bold text-dark py-3">
                      {team === 'Unassigned' ? <span className="text-muted fst-italic">Unassigned</span> : team}
                    </td>
                    <td className="fw-bold">{stats.total}</td>
                    <td className="text-muted">{stats.pending}</td>
                    <td className="text-warning fw-bold">{stats.inProgress}</td>
                    <td className="text-success fw-bold">{stats.completed}</td>
                    <td style={{width: '150px'}}>
                      <div className="progress" style={{height: '6px'}}>
                        <div className="progress-bar bg-success" style={{width: `${progress}%`}}></div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;