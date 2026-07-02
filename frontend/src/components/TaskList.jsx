import React, { useState } from 'react';
import api from '../api';
import { Link, useNavigate } from 'react-router-dom';
import AssignTaskModal from './AssignTaskModal';
import EditTaskModal from './EditTaskModal';
import { toast } from 'react-toastify';

const STATUS_BADGE = {
  Pending:     'ts-badge ts-badge-pending',
  Assigned:    'ts-badge ts-badge-assigned',
  'In Progress': 'ts-badge ts-badge-progress',
  Completed:   'ts-badge ts-badge-completed',
  Expired:     'ts-badge ts-badge-expired',
};

const TaskList = ({ tasks, onTaskUpdate }) => {
  const navigate = useNavigate();
  const [assignModalTask, setAssignModalTask] = useState(null);
  const [editModalTask, setEditModalTask] = useState(null);

  const role          = localStorage.getItem('role');
  const currentUserId = localStorage.getItem('userId');

  const updateStatus = async (taskId, newStatus) => {
    try {
      await api.put('/task/status', { taskId, status: newStatus });
      toast.info('Status updated.');
      if (onTaskUpdate) onTaskUpdate();
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Delete this task permanently?')) return;
    try {
      await api.delete(`/task/${taskId}`);
      toast.success('Task deleted.');
      if (onTaskUpdate) onTaskUpdate();
    } catch (err) {
      toast.error('Delete failed.');
    }
  };

  if (tasks.length === 0) {
    return (
      <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '48px 0', fontSize: '0.875rem' }}>
        No tasks to display.
      </p>
    );
  }

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
        {tasks.map(task => {
          const isAssignedToMe = task.assignedTo.some(u => u._id === currentUserId);
          const haveIFinished  = task.completedBy?.some(u => u._id === currentUserId);
          const isExpired      = task.status !== 'Completed' && new Date() > new Date(task.deadline);

          let displayStatus = task.status;
          if (isExpired) displayStatus = 'Expired';

          const badgeClass = STATUS_BADGE[displayStatus] || 'ts-badge ts-badge-pending';
          const daysLeft = Math.abs(Math.ceil((new Date(task.deadline) - new Date()) / (1000 * 60 * 60 * 24)));

          if (role === 'PM') {
            return (
              <div key={task._id} className="ts-task-card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Header: Title and Badge/Delete */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h6 style={{ fontWeight: 700, fontSize: '1.1rem', margin: 0, lineHeight: 1.3 }}>
                      <Link
                        to={`/task/${task._id}`}
                        style={{ color: 'var(--text)', textDecoration: 'none' }}
                        onMouseOver={e => e.target.style.color = 'var(--accent)'}
                        onMouseOut={e => e.target.style.color = 'var(--text)'}
                      >
                        {task.title}
                      </Link>
                    </h6>
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {task.assignedTo.length > 1 ? (
                      <span className="ts-badge ts-badge-assigned" style={{ background: 'var(--accent-light)', color: 'var(--accent)', padding: '3px 8px', fontSize: '0.75rem' }}>
                        Team Task
                      </span>
                    ) : (
                      <span className="ts-badge ts-badge-success" style={{ background: 'var(--success-light)', color: 'var(--success)', padding: '3px 8px', fontSize: '0.75rem' }}>
                        Individual Task
                      </span>
                    )}
                    <button
                      className="ts-btn ts-btn-danger ts-btn-sm"
                      style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(task._id); }}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Description */}
                <p style={{
                  fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0,
                  display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
                  overflow: 'hidden', lineHeight: 1.5
                }}>
                  {task.description || 'No description.'}
                </p>

                {/* Assigned & Deadline Dates Box */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  padding: '12px 16px',
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  marginTop: 4
                }}>
                  <div>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      Assigned
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', marginTop: 4 }}>
                      {new Date(task.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      Deadline
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: isExpired ? 'var(--danger)' : 'var(--text)', marginTop: 4 }}>
                      {new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                </div>

                {/* Team Members & Status Section */}
                <div style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    Team Members & Status
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 110, overflowY: 'auto', paddingRight: 4 }}>
                    {task.assignedTo.length > 0 ? (
                      task.assignedTo.map(u => {
                        const isMe = u._id === currentUserId;
                        const isDone = task.completedBy?.some(c => (c._id || c).toString() === u._id.toString());
                        const isWorking = task.acceptedBy?.some(a => (a._id || a).toString() === u._id.toString());

                        let statusText = 'Pending';
                        let statusClass = 'ts-badge-pending';
                        if (isDone) {
                          statusText = 'Done';
                          statusClass = 'ts-badge-completed';
                        } else if (isWorking) {
                          statusText = 'Working';
                          statusClass = 'ts-badge-progress';
                        }

                        return (
                          <div key={u._id} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '8px 12px',
                            borderRadius: 'var(--radius)',
                            background: 'var(--surface-2)',
                            border: '1px solid var(--border)'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text)' }}>
                                {u.name}
                              </span>
                              <span className="ts-badge" style={{
                                fontSize: '0.6rem',
                                padding: '1px 5px',
                                background: isMe ? 'var(--accent-light)' : 'var(--border)',
                                color: isMe ? 'var(--accent)' : 'var(--text-muted)'
                              }}>
                                {isMe ? 'You' : 'Team Member'}
                              </span>
                            </div>
                            <span className={`ts-badge ${statusClass}`} style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
                              {statusText}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', fontStyle: 'italic' }}>No members assigned</span>
                    )}
                  </div>
                </div>

                {/* Action Buttons Footer */}
                <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="ts-btn ts-btn-ghost ts-btn-sm" style={{ flex: 1 }}
                            onClick={() => setEditModalTask(task)}>
                      Edit
                    </button>
                    {task.status !== 'Completed' && (
                      <button className="ts-btn ts-btn-ghost ts-btn-sm" style={{ flex: 1 }}
                              onClick={() => setAssignModalTask(task)}>
                        Assign
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          } else {
            return (
              <div key={task._id} className="ts-task-card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Header: Status badge and Team/Individual badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className={badgeClass}>{displayStatus}</span>
                  {task.assignedTo.length > 1 ? (
                    <span className="ts-badge ts-badge-assigned" style={{ background: 'var(--accent-light)', color: 'var(--accent)', padding: '3px 8px', fontSize: '0.75rem' }}>
                      Team Task
                    </span>
                  ) : (
                    <span className="ts-badge ts-badge-success" style={{ background: 'var(--success-light)', color: 'var(--success)', padding: '3px 8px', fontSize: '0.75rem' }}>
                      Individual Task
                    </span>
                  )}
                </div>

                {/* Title */}
                <h6 style={{ fontWeight: 700, fontSize: '1.1rem', margin: 0, lineHeight: 1.3 }}>
                  <Link
                    to={`/task/${task._id}`}
                    style={{ color: 'var(--text)', textDecoration: 'none' }}
                    onMouseOver={e => e.target.style.color = 'var(--accent)'}
                    onMouseOut={e => e.target.style.color = 'var(--text)'}
                  >
                    {task.title}
                  </Link>
                </h6>

                {/* Description */}
                <p style={{
                  fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0,
                  display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
                  overflow: 'hidden', lineHeight: 1.5, minHeight: 40
                }}>
                  {task.description || 'No description.'}
                </p>

                {/* Footer: Avatars stack and Deadline */}
                <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    {/* Avatar stack */}
                    <div style={{ display: 'flex' }}>
                      {task.assignedTo.length > 0 ? (
                        task.assignedTo.slice(0, 4).map((u, i) => {
                          const isDone = task.completedBy?.some(c => (c._id || c).toString() === u._id.toString());
                          const isWorking = task.acceptedBy?.some(a => (a._id || a).toString() === u._id.toString());

                          let dotColor = '#9ca3af'; // Pending
                          let statusText = 'Pending';
                          if (isDone) {
                            dotColor = '#10b981'; // Done
                            statusText = 'Done';
                          } else if (isWorking) {
                            dotColor = '#f59e0b'; // Working
                            statusText = 'Working';
                          }

                          return (
                            <div
                              key={u._id}
                              title={`${u.name} (${statusText})`}
                              style={{
                                width: 26, height: 26,
                                borderRadius: '50%',
                                background: 'var(--accent-light)',
                                color: 'var(--accent)',
                                fontSize: '0.65rem', fontWeight: 700,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: '2px solid var(--surface)',
                                marginLeft: i > 0 ? -8 : 0,
                                zIndex: 4 - i,
                                position: 'relative'
                              }}
                            >
                              {u.name.charAt(0)}
                              <div style={{
                                position: 'absolute',
                                top: -2,
                                right: -2,
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                background: dotColor,
                                border: '1.5px solid var(--surface)'
                              }} />
                            </div>
                          );
                        })
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', fontStyle: 'italic' }}>Unassigned</span>
                      )}
                    </div>

                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: isExpired ? 'var(--danger)' : 'var(--text-muted)' }}>
                      {isExpired ? 'Overdue' : `${daysLeft}d left`}
                    </span>
                  </div>

                  {/* Buttons */}
                  <div style={{ display: 'flex', gap: 6 }}>
                    {isAssignedToMe && (
                      <>
                        {task.status === 'Assigned' && (
                          <button className="ts-btn ts-btn-primary ts-btn-sm" style={{ flex: 1 }}
                                  onClick={() => updateStatus(task._id, 'In Progress')}>
                            Accept & Start
                          </button>
                        )}
                        {task.status === 'In Progress' && !haveIFinished && (
                          <button className="ts-btn ts-btn-ghost ts-btn-sm" style={{ flex: 1 }}
                                  onClick={() => navigate(`/task/${task._id}`)}>
                            View Details
                          </button>
                        )}
                        {task.status === 'In Progress' && haveIFinished && (
                          <button className="ts-btn ts-btn-ghost ts-btn-sm" style={{ flex: 1 }} disabled>
                            Waiting for team...
                          </button>
                        )}
                        {task.status === 'Completed' && (
                          <button className="ts-btn ts-btn-success ts-btn-sm" style={{ flex: 1 }} disabled>
                            Done
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          }
        })}
      </div>

      <AssignTaskModal
        task={assignModalTask}
        onClose={() => setAssignModalTask(null)}
        onAssignSuccess={() => { if (onTaskUpdate) onTaskUpdate(); setAssignModalTask(null); }}
      />
      <EditTaskModal
        task={editModalTask}
        onClose={() => setEditModalTask(null)}
        onUpdateSuccess={() => { if (onTaskUpdate) onTaskUpdate(); setEditModalTask(null); }}
      />
    </>
  );
};

export default TaskList;