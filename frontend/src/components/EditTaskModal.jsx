import React, { useState } from 'react';
import api from '../api';
import { toast } from 'react-toastify';

const EditTaskModal = ({ task, onClose, onUpdateSuccess }) => {
  if (!task) return null;

  const [formData, setFormData] = useState({
    title: task.title || '',
    description: task.description || '',
    deadline: task.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/task/edit/${task._id}`, formData);
      toast.success('Task updated!');
      onUpdateSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ts-modal-overlay" onClick={onClose}>
      <div className="ts-modal" onClick={e => e.stopPropagation()}>
        <div className="ts-modal-header">
          <div>
            <p style={{ margin: 0, fontWeight: 700, color: 'var(--text)' }}>Edit Task</p>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {task.title}
            </p>
          </div>
          <button className="ts-close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="ts-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="ts-label">Title</label>
              <input
                className="ts-input"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="ts-label">Description</label>
              <textarea
                className="ts-input"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{ resize: 'none' }}
              />
            </div>
            <div>
              <label className="ts-label">Deadline</label>
              <input
                className="ts-input"
                type="datetime-local"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="ts-modal-footer">
            <button type="button" className="ts-btn ts-btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="ts-btn ts-btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTaskModal;