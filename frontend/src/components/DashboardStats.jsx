import React, { useState, useEffect } from 'react';
import api from '../api';

const statConfig = [
  { label: 'Total Tasks',  key: 'total',      accent: 'var(--text)' },
  { label: 'In Progress',  key: 'inProgress',  accent: 'var(--warning)' },
  { label: 'Completed',    key: 'completed',   accent: 'var(--success)' },
  { label: 'Pending',      key: 'pending',     accent: 'var(--text-muted)' },
];

const teams = ['General', 'Frontend', 'Backend', 'QA', 'Marketing'];

const DashboardStats = ({ tasks = [], filteredTasks = [], role = 'PM' }) => {
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    if (role !== 'Employee') return;
    const fetchEmployees = async () => {
      const companyId = localStorage.getItem('companyId');
      if (!companyId) return;
      try {
        const res = await api.get(`/employees/search?companyId=${companyId}&query=&includeResigned=false`);
        setEmployees(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchEmployees();
  }, [role]);

  const displayTasks = role === 'PM' ? tasks : filteredTasks;

  const total      = displayTasks.length;
  const completed  = displayTasks.filter(t => t.status === 'Completed').length;
  const inProgress = displayTasks.filter(t => t.status === 'In Progress').length;
  const pending    = displayTasks.filter(t => t.status === 'Pending' || t.status === 'Assigned').length;

  // Team breakdown (PM view)
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

      {/* Team Performance Table (PM view only) */}
      {role === 'PM' && (
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
      )}

      {/* Team Work Status (Employee view only) */}
      {role === 'Employee' && (
        <div className="ts-surface" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
            <span className="ts-section-title">Colleagues' Active Work</span>
          </div>
          <div style={{ padding: 20 }}>
            {employees.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
                No active team members found.
              </p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                {employees.map(emp => {
                  const activeTasks = tasks.filter(t => 
                    t.assignedTo?.some(u => u._id === emp._id) && 
                    (t.status === 'In Progress' || t.status === 'Assigned')
                  );

                  return (
                    <div key={emp._id} style={{
                      padding: 14,
                      borderRadius: 'var(--radius)',
                      border: '1px solid var(--border)',
                      background: 'var(--surface)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="ts-avatar">{emp.name.charAt(0)}</div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text)' }}>
                            {emp.name}
                          </div>
                          <span className="ts-badge ts-badge-emp" style={{ fontSize: '0.65rem', padding: '1px 5px' }}>
                            {emp.team}
                          </span>
                        </div>
                      </div>

                      <div style={{ borderTop: '1px dashed var(--border)', paddingTop: 8, marginTop: 4 }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                          ACTIVE TASKS ({activeTasks.length})
                        </span>
                        {activeTasks.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6 }}>
                            {activeTasks.map(t => {
                              const statusColor = t.status === 'In Progress' ? '#eab308' : '#3b82f6';
                              return (
                                <div key={t._id} style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 6,
                                  fontSize: '0.75rem',
                                  color: 'var(--text)'
                                }}>
                                  <span style={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: '50%',
                                    background: statusColor,
                                    flexShrink: 0
                                  }} />
                                  <span style={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }} title={t.title}>
                                    {t.title}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: 'var(--text-subtle)', fontStyle: 'italic' }}>
                            No active tasks.
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardStats;