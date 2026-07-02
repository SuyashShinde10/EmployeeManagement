import React from 'react';

const statConfig = [
  { label: 'Total Tasks',  key: 'total',      accent: 'var(--text)' },
  { label: 'In Progress',  key: 'inProgress',  accent: 'var(--warning)' },
  { label: 'Completed',    key: 'completed',   accent: 'var(--success)' },
  { label: 'Pending',      key: 'pending',     accent: 'var(--text-muted)' },
];

const teams = ['General', 'Frontend', 'Backend', 'QA', 'Marketing'];

const DashboardStats = ({ tasks = [] }) => {
  const total      = tasks.length;
  const completed  = tasks.filter(t => t.status === 'Completed').length;
  const inProgress = tasks.filter(t => t.status === 'In Progress').length;
  const pending    = tasks.filter(t => t.status === 'Pending' || t.status === 'Assigned').length;

  // Team breakdown
  const teamStats = {};
  [...teams, 'Unassigned'].forEach(t => {
    teamStats[t] = { total: 0, pending: 0, inProgress: 0, completed: 0 };
  });

  tasks.forEach(task => {
    let teamName = 'Unassigned';
    if (task.assignedTo?.length > 0) {
      const ut = task.assignedTo[0].team;
      teamName = teams.includes(ut) ? ut : 'General';
    }
    teamStats[teamName].total++;
    if (task.status === 'Completed')       teamStats[teamName].completed++;
    else if (task.status === 'In Progress') teamStats[teamName].inProgress++;
    else                                    teamStats[teamName].pending++;
  });

  const counts = { total, inProgress, completed, pending };

  return (
    <div style={{ marginBottom: 32 }}>
      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 16 }}>
        {statConfig.map(({ label, key, accent }) => (
          <div key={key} className="ts-stat-card">
            <span className="ts-label">{label}</span>
            <span className="ts-stat-value" style={{ color: accent }}>{counts[key]}</span>
          </div>
        ))}
      </div>

      {/* Team Table */}
      <div className="ts-surface" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
          <span className="ts-section-title">Team Performance</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="ts-table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Total</th>
                <th>Pending</th>
                <th>In Progress</th>
                <th>Done</th>
                <th style={{ width: 140 }}>Health</th>
              </tr>
            </thead>
            <tbody>
              {[...teams, 'Unassigned'].map(team => {
                const s = teamStats[team];
                if (team === 'Unassigned' && s.total === 0) return null;
                const pct = s.total > 0 ? (s.completed / s.total) * 100 : 0;
                return (
                  <tr key={team}>
                    <td style={{ fontWeight: 500 }}>{team}</td>
                    <td>{s.total}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{s.pending}</td>
                    <td style={{ color: 'var(--warning)', fontWeight: 600 }}>{s.inProgress}</td>
                    <td style={{ color: 'var(--success)', fontWeight: 600 }}>{s.completed}</td>
                    <td>
                      <div className="ts-progress">
                        <div className="ts-progress-bar" style={{ width: `${pct}%` }} />
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