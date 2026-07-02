import React, { useState, useEffect } from 'react';
import api from '../api';
import { toast } from 'react-toastify';

const AssignTaskModal = ({ task, onClose, onAssignSuccess }) => {
  const [query, setQuery] = useState('');
  const [employees, setEmployees] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const searchEmployees = async () => {
      const companyId = localStorage.getItem('companyId');
      if (!companyId) return;
      try {
        const res = await api.get(`/employees/search?companyId=${companyId}&query=${query}`);
        setEmployees(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    const timeout = setTimeout(searchEmployees, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  if (!task) return null;

  const toggle = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleAssign = async () => {
    if (selectedIds.length === 0) return;
    setLoading(true);
    try {
      await api.put('/task/assign', {
        taskId: task._id,
        employeeIds: selectedIds
      });
      toast.success('Task assigned!');
      onAssignSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Assignment failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ts-modal-overlay" onClick={onClose}>
      <div className="ts-modal" onClick={e => e.stopPropagation()}>
        <div className="ts-modal-header">
          <div>
            <p style={{ margin: 0, fontWeight: 700, color: 'var(--text)' }}>Assign Task</p>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {task.title}
            </p>
          </div>
          <button className="ts-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="ts-modal-body">
          {/* Search */}
          <div className="ts-search" style={{ marginBottom: 12 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 strokeWidth="2" style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              placeholder="Search by name or team..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>

          {/* Employee List */}
          <div style={{
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            maxHeight: 240,
            overflowY: 'auto'
          }}>
            {employees.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
                No active employees found.
              </p>
            ) : employees.map(emp => {
              const isAlreadyAssigned = task.assignedTo?.some(u => u._id === emp._id);
              const isSelected = selectedIds.includes(emp._id);
              return (
                <label
                  key={emp._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 14px',
                    borderBottom: '1px solid var(--border)',
                    cursor: isAlreadyAssigned ? 'default' : 'pointer',
                    background: isSelected ? 'var(--accent-light)' : isAlreadyAssigned ? 'var(--surface-2)' : 'transparent',
                    opacity: isAlreadyAssigned ? 0.7 : 1,
                    transition: 'background 0.1s'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isSelected || isAlreadyAssigned}
                    disabled={isAlreadyAssigned}
                    onChange={() => {
                      if (!isAlreadyAssigned) toggle(emp._id);
                    }}
                    style={{ accentColor: 'var(--accent)', width: 16, height: 16 }}
                  />
                  <div className="ts-avatar">{emp.name.charAt(0)}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text)' }}>{emp.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{emp.team}</div>
                  </div>
                  {isAlreadyAssigned && (
                    <span className="ts-badge ts-badge-assigned" style={{ fontSize: '0.65rem', marginLeft: 'auto', background: 'var(--border)', color: 'var(--text-muted)' }}>
                      Already Assigned
                    </span>
                  )}
                </label>
              );
            })}
          </div>

          <p style={{ margin: '8px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {selectedIds.length} selected
          </p>
        </div>

        <div className="ts-modal-footer">
          <button className="ts-btn ts-btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="ts-btn ts-btn-primary"
            onClick={handleAssign}
            disabled={selectedIds.length === 0 || loading}
          >
            {loading ? 'Assigning...' : 'Confirm Assignment'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignTaskModal;