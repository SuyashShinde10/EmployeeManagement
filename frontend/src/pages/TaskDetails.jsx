import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import { socket, isSocketSupported } from '../socket';

const STATUS_BADGE = {
  Pending:       'ts-badge ts-badge-pending',
  Assigned:      'ts-badge ts-badge-assigned',
  'In Progress': 'ts-badge ts-badge-progress',
  Completed:     'ts-badge ts-badge-completed',
  Expired:       'ts-badge ts-badge-expired',
};

const TaskDetails = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const userId   = localStorage.getItem('userId');
  const role     = localStorage.getItem('role');

  const companyId = localStorage.getItem('companyId');

  const [task, setTask]         = useState(null);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchTask = async () => {
    try {
      const res = await api.get(`/task/${id}`);
      setTask(res.data);
    } catch (err) {
      toast.error('Failed to load task.');
    }
  };

  useEffect(() => {
    fetchTask();
  }, [id]);

  useEffect(() => {
    if (!companyId || !isSocketSupported) return;

    socket.connect();
    socket.emit('join_company', companyId);

    socket.on('task_updated', (updatedTask) => {
      if (updatedTask._id === id) {
        setTask(updatedTask);
      }
    });

    return () => {
      socket.off('task_updated');
      socket.disconnect();
    };
  }, [companyId, id]);

  // Serverless-safe fallback: poll task details every 5 seconds to support Vercel deployments
  useEffect(() => {
    if (!id) return;

    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/task/${id}`);
        setTask(prev => {
          if (JSON.stringify(prev) !== JSON.stringify(res.data)) {
            return res.data;
          }
          return prev;
        });
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [id]);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      await api.post(`/task/comment/${id}`, { text: newComment });
      setNewComment('');
      fetchTask();
      toast.success('Comment posted.');
    } catch (err) {
      toast.error('Failed to post comment.');
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (newStatus) => {
    try {
      await api.put('/task/status', { taskId: id, status: newStatus });
      if (newStatus === 'Completed') toast.success('Marked as done!');
      else toast.success('Task started.');
      fetchTask();
    } catch (err) {
      toast.error('Status update failed.');
    }
  };

  if (!task) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <Navbar />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 56px)', color: 'var(--text-muted)' }}>
          Loading task...
        </div>
      </div>
    );
  }

  const isAssignedToMe = task.assignedTo.some(u => u._id === userId);
  const haveIFinished  = task.completedBy?.some(u => u._id === userId);
  const isExpired      = task.status !== 'Completed' && new Date() > new Date(task.deadline);

  let displayStatus = task.status;
  if (isExpired) displayStatus = 'Expired';
  const badgeClass = STATUS_BADGE[displayStatus] || 'ts-badge ts-badge-pending';

  const completionPct = task.assignedTo.length > 0
    ? Math.round((task.completedBy.length / task.assignedTo.length) * 100)
    : 0;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '28px 24px' }}>

        {/* Back + Actions Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <button
            className="ts-btn ts-btn-ghost ts-btn-sm"
            onClick={() => navigate('/dashboard')}
          >
            ← Back
          </button>

          {role === 'Employee' && isAssignedToMe && (
            <div>
              {task.status === 'Assigned' && (
                <button className="ts-btn ts-btn-primary" onClick={() => updateStatus('In Progress')}>
                  Accept & Start
                </button>
              )}
              {task.status === 'In Progress' && !haveIFinished && (
                <button className="ts-btn ts-btn-success" onClick={() => updateStatus('Completed')}>
                  Mark My Part Done
                </button>
              )}
              {task.status === 'In Progress' && haveIFinished && (
                <button className="ts-btn ts-btn-ghost" disabled>
                  Waiting for team...
                </button>
              )}
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, alignItems: 'start' }}>

          {/* ─── Left Column ─────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Task Info Card */}
            <div className="ts-surface" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.3, color: 'var(--text)' }}>
                  {task.title}
                </h1>
                <span className={badgeClass} style={{ marginLeft: 12, flexShrink: 0 }}>{displayStatus}</span>
              </div>

              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.7, margin: '0 0 20px', whiteSpace: 'pre-wrap' }}>
                {task.description || 'No description provided.'}
              </p>

              {/* Assignees */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                <span className="ts-label">Assignees</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                  {task.assignedTo.map(u => {
                    const done = task.completedBy.some(c => c._id === u._id);
                    return (
                      <span
                        key={u._id}
                        className={`ts-badge ${done ? 'ts-badge-completed' : 'ts-badge-assigned'}`}
                      >
                        {u.name} {done && '✓'}
                      </span>
                    );
                  })}
                  {task.assignedTo.length === 0 && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', fontStyle: 'italic' }}>
                      No one assigned yet.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Discussion */}
            {role !== 'PM' && (
              <div className="ts-surface" style={{ overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                  <span className="ts-section-title">Discussion</span>
                </div>

                <div style={{ padding: '16px 20px', maxHeight: 320, overflowY: 'auto', background: 'var(--surface-2)' }}>
                  {task.comments.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', padding: '20px 0', margin: 0 }}>
                      No messages yet.
                    </p>
                  ) : task.comments.map((c, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                      <div className="ts-avatar" style={{ flexShrink: 0 }}>
                        {c.user?.name?.charAt(0) || '?'}
                      </div>
                      <div style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: '0 8px 8px 8px',
                        padding: '8px 12px',
                        flex: 1
                      }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', marginBottom: 4 }}>
                          <span style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text)' }}>
                            {c.user?.name}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>
                            {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text)', lineHeight: 1.5 }}>
                          {c.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleComment} style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
                  <input
                    className="ts-input"
                    placeholder="Write a message..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button
                    type="submit"
                    className="ts-btn ts-btn-primary"
                    disabled={submitting || !newComment.trim()}
                    style={{ padding: '8px 16px' }}
                  >
                    Send
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* ─── Right Sidebar ────────────────────────────────────────── */}
          <div className="ts-surface" style={{ padding: 20 }}>
            <span className="ts-label" style={{ marginBottom: 16, display: 'block' }}>Details</span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <span className="ts-label">Deadline</span>
                <span style={{ fontWeight: 600, fontSize: '0.875rem', color: isExpired ? 'var(--danger)' : 'var(--text)' }}>
                  {new Date(task.deadline).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>

              <div>
                <span className="ts-label">Created</span>
                <span style={{ fontWeight: 500, fontSize: '0.875rem', color: 'var(--text)' }}>
                  {new Date(task.createdAt).toLocaleDateString()}
                </span>
              </div>

              {task.acceptedAt && (
                <div>
                  <span className="ts-label">Started</span>
                  <span style={{ fontWeight: 500, fontSize: '0.875rem', color: 'var(--text)' }}>
                    {new Date(task.acceptedAt).toLocaleDateString()}
                  </span>
                </div>
              )}

              {task.completedAt && (
                <div>
                  <span className="ts-label">Completed</span>
                  <span style={{ fontWeight: 500, fontSize: '0.875rem', color: 'var(--success)' }}>
                    {new Date(task.completedAt).toLocaleDateString()}
                  </span>
                </div>
              )}

              <div>
                <span className="ts-label">Team Progress</span>
                <div style={{ marginTop: 6 }}>
                  <div className="ts-progress">
                    <div className="ts-progress-bar" style={{ width: `${completionPct}%` }} />
                  </div>
                  <p style={{ margin: '6px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {task.completedBy.length} / {task.assignedTo.length} members done
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;