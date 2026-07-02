import React, { useEffect, useState } from 'react';
import api from '../api';
import { toast } from 'react-toastify';
import EditEmployeeModal from './EditEmployeeModal';

const EmployeeList = ({ refreshTrigger }) => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingEmp, setEditingEmp] = useState(null);
  const [activeTab, setActiveTab] = useState('active');
  const [internalRefresh, setInternalRefresh] = useState(0);

  useEffect(() => {
    const fetchEmployees = async () => {
      const companyId = localStorage.getItem('companyId');
      if (!companyId) return;
      try {
        const res = await api.get(`/employees/search?companyId=${companyId}&query=&includeResigned=true`);
        setEmployees(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchEmployees();
  }, [refreshTrigger, internalRefresh]);

  const handleDelete = async (id) => {
    if (!window.confirm('Archive this employee? They will lose access.')) return;
    try {
      await api.put(`/employee/delete/${id}`, {});
      toast.info('Employee archived.');
      setInternalRefresh(prev => prev + 1);
    } catch (err) {
      toast.error('Failed to archive.');
    }
  };

  const filtered = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.team.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const active   = filtered.filter(e => e.status === 'Active');
  const resigned = filtered.filter(e => e.status === 'Resigned');
  const display  = activeTab === 'active' ? active : resigned;

  return (
    <div className="ts-surface" style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="ts-section-title">Team Directory</span>
        <div className="ts-search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               strokeWidth="2" style={{ color: 'var(--text-muted)' }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ padding: '0 20px', display: 'flex', gap: 0, borderBottom: '1px solid var(--border)' }}>
        <button
          className={`ts-tab ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          Active ({active.length})
        </button>
        <button
          className={`ts-tab ${activeTab === 'resigned' ? 'active' : ''}`}
          onClick={() => setActiveTab('resigned')}
        >
          Archived ({resigned.length})
        </button>
      </div>

      {/* Table */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <table className="ts-table">
          <thead>
            <tr>
              <th style={{ paddingLeft: 20 }}>Name</th>
              <th>Department</th>
              <th style={{ textAlign: 'right', paddingRight: 20 }}></th>
            </tr>
          </thead>
          <tbody>
            {display.map(emp => (
              <tr key={emp._id}>
                <td style={{ paddingLeft: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="ts-avatar">{emp.name.charAt(0)}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text)' }}>{emp.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{emp.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="ts-badge ts-badge-emp">{emp.team}</span>
                </td>
                <td style={{ textAlign: 'right', paddingRight: 20 }}>
                  {activeTab === 'active' && (
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                      <button
                        className="ts-btn ts-btn-ghost ts-btn-sm"
                        onClick={() => setEditingEmp(emp)}
                        title="Edit"
                      >
                        Edit
                      </button>
                      <button
                        className="ts-btn ts-btn-danger ts-btn-sm"
                        onClick={() => handleDelete(emp._id)}
                        title="Archive"
                      >
                        Archive
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {display.length === 0 && (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  No employees found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editingEmp && (
        <EditEmployeeModal
          employee={editingEmp}
          onClose={() => setEditingEmp(null)}
          onSuccess={() => setInternalRefresh(prev => prev + 1)}
        />
      )}
    </div>
  );
};

export default EmployeeList;