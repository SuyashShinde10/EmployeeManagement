import React, { useState } from 'react';

const statConfig = [
  { label: 'Total Tasks',  key: 'total',      accent: 'var(--text)' },
  { label: 'In Progress',  key: 'inProgress',  accent: 'var(--warning)' },
  { label: 'Completed',    key: 'completed',   accent: 'var(--success)' },
  { label: 'Pending',      key: 'pending',     accent: 'var(--text-muted)' },
];

const teams = ['General', 'Frontend', 'Backend', 'QA', 'Marketing'];

const DashboardStats = ({ tasks = [], filteredTasks = [], role = 'PM' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const userId = localStorage.getItem('userId');

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

  // Filter tasks that are assigned to multiple employees (for the Colleagues' Active Work view)
  const sharedTasks = tasks.filter(task => task.assignedTo?.length > 1);

  // Filter by search term
  const filteredSharedTasks = sharedTasks.filter(task => {
    const query = searchTerm.toLowerCase();
    const matchTitle = task.title.toLowerCase().includes(query);
    const matchDesc = task.description?.toLowerCase().includes(query) || false;
    const matchMember = task.assignedTo?.some(u => u.name.toLowerCase().includes(query));
    return matchTitle || matchDesc || matchMember;
  });

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
        <div className="ts-surface" style={{ padding: '20px', borderRadius: 'var(--radius-lg)' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
            marginBottom: 16,
            borderBottom: '1px solid var(--border)',
            paddingBottom: 14
          }}>
            <div>
              <span className="ts-section-title" style={{ fontSize: '1rem', fontWeight: 700 }}>
                Colleagues' Active Work
              </span>
              <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Shared team tasks and member status tracking.
              </p>
            </div>
            {/* Search Input */}
            <div style={{ position: 'relative', width: '100%', maxWidth: 280 }}>
              <input
                type="text"
                placeholder="Search shared tasks or members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'var(--surface-2)',
                  color: 'var(--text)',
                  fontSize: '0.8rem',
                  outline: 'none',
                  transition: 'border-color 0.15s'
                }}
              />
            </div>
          </div>

          {filteredSharedTasks.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '32px 0', margin: 0 }}>
              {searchTerm ? 'No matching shared tasks found.' : 'No shared tasks assigned currently.'}
            </p>
          ) : (
            /* Horizontal Scroll Container */
            <div style={{
              display: 'flex',
              gap: 16,
              overflowX: 'auto',
              paddingBottom: 12,
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch'
            }}>
              {filteredSharedTasks.map(task => {
                const assignedDate = new Date(task.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });
                const deadlineDate = new Date(task.deadline).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });

                return (
                  <div key={task._id} style={{
                    flex: '0 0 340px',
                    scrollSnapAlign: 'start',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    background: 'var(--surface)',
                    padding: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: 300,
                    boxShadow: 'var(--shadow-sm)'
                  }}>
                    {/* Header */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                        <span style={{
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          color: 'var(--text)',
                          lineHeight: 1.3
                        }}>
                          {task.title}
                        </span>
                        <span className="ts-badge ts-badge-team" style={{
                          background: 'var(--accent-light)',
                          color: 'var(--accent)',
                          fontSize: '0.65rem',
                          padding: '2px 6px',
                          fontWeight: 600,
                          borderRadius: 4
                        }}>
                          Team Task
                        </span>
                      </div>

                      {/* Description */}
                      <p style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-muted)',
                        margin: '0 0 14px',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: 1.4
                      }} title={task.description}>
                        {task.description || 'No description provided.'}
                      </p>
                    </div>

                    {/* Meta info & Members status */}
                    <div>
                      {/* Dates */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 8,
                        background: 'var(--bg)',
                        padding: '8px 10px',
                        borderRadius: 6,
                        marginBottom: 12,
                        fontSize: '0.7rem',
                        border: '1px solid var(--border)'
                      }}>
                        <div>
                          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.6rem', textTransform: 'uppercase', fontWeight: 600, marginBottom: 2 }}>Assigned</span>
                          <span style={{ color: 'var(--text)', fontWeight: 500 }}>{assignedDate}</span>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.6rem', textTransform: 'uppercase', fontWeight: 600, marginBottom: 2 }}>Deadline</span>
                          <span style={{ color: 'var(--text)', fontWeight: 500 }}>{deadlineDate}</span>
                        </div>
                      </div>

                      {/* Members Status List */}
                      <div>
                        <div style={{
                          fontSize: '0.7rem',
                          color: 'var(--text-muted)',
                          fontWeight: 600,
                          marginBottom: 6,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          Team Members & Status
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 110, overflowY: 'auto', paddingRight: 4 }}>
                          {task.assignedTo?.map(member => {
                            const isMe = member._id === userId;
                            const hasCompleted = task.completedBy?.some(c => (c._id || c).toString() === member._id.toString());
                            const hasAccepted = task.acceptedBy?.some(a => (a._id || a).toString() === member._id.toString());
                            
                            let memberStatus = 'Pending';
                            let statusColor = 'var(--text-muted)';
                            let statusBg = 'var(--border)';

                            if (hasCompleted) {
                              memberStatus = 'Done';
                              statusColor = 'var(--success)';
                              statusBg = 'var(--success-light)';
                            } else if (hasAccepted) {
                              memberStatus = 'Working';
                              statusColor = 'var(--warning)';
                              statusBg = 'var(--warning-light)';
                            }

                            return (
                              <div key={member._id} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                fontSize: '0.75rem',
                                padding: '6px 8px',
                                borderRadius: 6,
                                background: 'var(--bg)',
                                border: '1px solid var(--border)'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <span style={{
                                    fontWeight: 600,
                                    color: 'var(--text)'
                                  }}>
                                    {member.name}
                                  </span>
                                  <span style={{
                                    fontSize: '0.65rem',
                                    color: isMe ? 'var(--accent)' : 'var(--text-muted)',
                                    background: isMe ? 'var(--accent-light)' : 'var(--border)',
                                    padding: '1px 4px',
                                    borderRadius: 4,
                                    fontWeight: 500
                                  }}>
                                    {isMe ? 'You' : 'Team Member'}
                                  </span>
                                </div>
                                <span style={{
                                  fontSize: '0.65rem',
                                  fontWeight: 600,
                                  color: statusColor,
                                  background: statusBg,
                                  padding: '2px 6px',
                                  borderRadius: 4
                                }}>
                                  {memberStatus}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardStats;