import React, { useState } from 'react';
import api from '../api';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();
  const userId      = localStorage.getItem('userId');
  const initialName = localStorage.getItem('name');
  const role        = localStorage.getItem('role');

  const [formData, setFormData] = useState({
    name: initialName || '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password && formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match.');
    }
    if (formData.password && formData.password.length < 8) {
      return toast.error('Password must be at least 8 characters.');
    }

    setLoading(true);
    try {
      const res = await api.put(`/user/profile/${userId}`, {
        name: formData.name,
        ...(formData.password && { password: formData.password })
      });
      toast.success('Profile updated!');
      localStorage.setItem('name', res.data.user.name);
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed.');
    } finally {
      setLoading(false);
    }
  };

  const initials = formData.name ? formData.name.charAt(0).toUpperCase() : '?';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />

      <div style={{ maxWidth: 480, margin: '40px auto', padding: '0 16px' }}>

        {/* Avatar + Name */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'var(--accent-light)', color: 'var(--accent)',
            fontSize: '1.5rem', fontWeight: 700,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 12
          }}>
            {initials}
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>
              {formData.name}
            </p>
            <span className={`ts-badge ${role === 'HR' ? 'ts-badge-hr' : 'ts-badge-emp'}`}>
              {role}
            </span>
          </div>
        </div>

        {/* Form Card */}
        <div className="ts-surface">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <span className="ts-section-title">Edit Profile</span>
          </div>

          <form onSubmit={handleSubmit} style={{ padding: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              <div>
                <label className="ts-label">Full Name</label>
                <input
                  className="ts-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  minLength={2}
                />
              </div>

              {/* Security section */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 4 }}>
                <span className="ts-label" style={{ marginBottom: 12 }}>Change Password</span>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 12px' }}>
                  Leave blank to keep your current password.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label className="ts-label">New Password</label>
                    <input
                      className="ts-input"
                      type="password"
                      placeholder="Min. 8 characters"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="ts-label">Confirm Password</label>
                    <input
                      className="ts-input"
                      type="password"
                      placeholder="Repeat new password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <button className="ts-btn ts-btn-primary ts-btn-full" type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button
            className="ts-btn ts-btn-ghost ts-btn-sm"
            onClick={() => navigate('/dashboard')}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;