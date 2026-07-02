import React, { useState } from 'react';
import api from '../api';
import { toast } from 'react-toastify';

const DEPARTMENTS = ['General', 'Frontend', 'Backend', 'QA', 'Marketing'];

const CreateEmployee = ({ onSuccess }) => {
  const [formData, setFormData] = useState({ name: '', email: '', team: 'General' });
  const [loading, setLoading] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const companyId = localStorage.getItem('companyId');
    setLoading(true);
    setGeneratedPassword(null);
    setCopied(false);

    try {
      const res = await api.post('/create-employee', { ...formData, hrCompanyId: companyId });
      setGeneratedPassword(res.data.generatedPassword);
      toast.success('Employee added!');
      setFormData({ name: '', email: '', team: 'General' });
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create employee.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPassword).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const dismiss = () => setGeneratedPassword(null);

  return (
    <div className="ts-form-card">
      <div className="ts-form-card-header">
        <span className="ts-section-title">Onboard Employee</span>
      </div>
      <div className="ts-form-card-body">
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label className="ts-label">Full Name</label>
              <input
                className="ts-input"
                name="name"
                placeholder="e.g. Priya Sharma"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="ts-label">Work Email</label>
              <input
                className="ts-input"
                type="email"
                name="email"
                placeholder="e.g. priya@company.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="ts-label">Department</label>
              <select
                className="ts-select"
                name="team"
                value={formData.team}
                onChange={handleChange}
              >
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
              A secure password will be auto-generated and shown once.
            </p>

            <button className="ts-btn ts-btn-primary ts-btn-full" type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add to Team'}
            </button>
          </div>
        </form>

        {/* Password Reveal */}
        {generatedPassword && (
          <div className="ts-password-reveal">
            <p style={{ margin: '0 0 8px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--success)' }}>
              Employee created — share this password once and securely:
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span className="ts-password-code">{generatedPassword}</span>
              <button
                className="ts-btn ts-btn-ghost ts-btn-sm"
                type="button"
                onClick={handleCopy}
                style={{ marginLeft: 'auto' }}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p style={{ margin: '8px 0 0', fontSize: '0.7rem', color: '#15803d' }}>
              This password will not be shown again.
            </p>
            <button
              type="button"
              onClick={dismiss}
              style={{
                marginTop: 10, background: 'none', border: 'none', fontSize: '0.75rem',
                color: 'var(--text-muted)', cursor: 'pointer', padding: 0, fontFamily: 'inherit'
              }}
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateEmployee;