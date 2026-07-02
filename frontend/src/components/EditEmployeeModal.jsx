import React, { useState } from 'react';
import api from '../api';
import { toast } from 'react-toastify';

const DEPARTMENTS = ['General', 'Frontend', 'Backend', 'QA', 'Marketing'];

const EditEmployeeModal = ({ employee, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: employee.name,
    email: employee.email,
    team: employee.team
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/employee/edit/${employee._id}`, formData);
      toast.success('Employee updated.');
      onSuccess();
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
            <p style={{ margin: 0, fontWeight: 700, color: 'var(--text)' }}>Edit Employee</p>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {employee.name}
            </p>
          </div>
          <button className="ts-close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="ts-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="ts-label">Name</label>
              <input
                className="ts-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="ts-label">Email</label>
              <input
                className="ts-input"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="ts-label">Department</label>
              <select
                className="ts-select"
                value={formData.team}
                onChange={(e) => setFormData({ ...formData, team: e.target.value })}
              >
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
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

export default EditEmployeeModal;