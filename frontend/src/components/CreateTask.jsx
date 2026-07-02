import React, { useState } from 'react';
import api from '../api';
import { toast } from 'react-toastify';

const CreateTask = ({ refreshTasks }) => {
  const [task, setTask] = useState({ title: '', description: '', deadline: '' });
  const [loading, setLoading] = useState(false);

  const getMinDateTime = () => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (new Date(task.deadline) < new Date()) {
      return toast.warning('Deadline cannot be in the past.');
    }
    const companyId = localStorage.getItem('companyId');
    setLoading(true);
    try {
      await api.post('/task/create', { ...task, companyId });
      toast.success('Task created!');
      setTask({ title: '', description: '', deadline: '' });
      if (refreshTasks) refreshTasks();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create task.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ts-form-card">
      <div className="ts-form-card-header">
        <span className="ts-section-title">New Task</span>
      </div>
      <div className="ts-form-card-body">
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label className="ts-label">Title</label>
              <input
                className="ts-input"
                placeholder="What needs to be done?"
                value={task.title}
                onChange={(e) => setTask({ ...task, title: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="ts-label">Description</label>
              <textarea
                className="ts-input"
                placeholder="Add details..."
                rows={3}
                value={task.description}
                onChange={(e) => setTask({ ...task, description: e.target.value })}
                style={{ resize: 'none' }}
              />
            </div>

            <div>
              <label className="ts-label">Deadline</label>
              <input
                className="ts-input"
                type="datetime-local"
                value={task.deadline}
                onChange={(e) => setTask({ ...task, deadline: e.target.value })}
                min={getMinDateTime()}
                required
              />
            </div>

            <button className="ts-btn ts-btn-primary ts-btn-full" type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTask;