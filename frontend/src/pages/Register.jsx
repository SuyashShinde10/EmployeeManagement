import React, { useState } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: '',
    hrName: '',
    email: '',
    password: ''
  });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 8) {
      return setError('Password must be at least 8 characters.');
    }
    setLoading(true);
    try {
      await api.post('/register-company', formData);
      navigate('/login', { state: { registered: true } });
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: 16
    }}>
      {/* Back to Home Link */}
      <Link to="/" style={{
        textDecoration: 'none',
        fontSize: '0.85rem',
        color: 'var(--text-subtle)',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        marginBottom: 12,
        fontWeight: 500
      }}>
        <span>←</span> Back to Home
      </Link>

      <Link to="/" style={{ textDecoration: 'none', marginBottom: 28 }}>
        <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text)', letterSpacing: '-0.5px' }}>
          TeamSync
        </span>
      </Link>

      <div className="ts-surface" style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ padding: '24px 28px' }}>
          <h1 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 4px', color: 'var(--text)' }}>
            Create your workspace
          </h1>
          <p style={{ margin: '0 0 24px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Set up your company and HR account in seconds.
          </p>

          {error && (
            <div style={{
              marginBottom: 16, padding: '10px 14px',
              background: 'var(--danger-light)', border: '1px solid #fca5a5',
              borderRadius: 'var(--radius)', fontSize: '0.8rem', color: 'var(--danger)'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="ts-label">Company Name</label>
                <input
                  className="ts-input"
                  name="companyName"
                  placeholder="Acme Corp"
                  onChange={handleChange}
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="ts-label">Your Name</label>
                <input
                  className="ts-input"
                  name="hrName"
                  placeholder="Jane Doe"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="ts-label">Work Email</label>
              <input
                className="ts-input"
                type="email"
                name="email"
                placeholder="jane@acme.com"
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="ts-label">Password</label>
              <input
                className="ts-input"
                type="password"
                name="password"
                placeholder="Min. 8 characters"
                onChange={handleChange}
                required
                minLength={8}
              />
            </div>

            <button
              className="ts-btn ts-btn-primary ts-btn-full"
              type="submit"
              disabled={loading}
              style={{ marginTop: 4 }}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        </div>

        <div style={{ padding: '14px 28px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Sign in
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Register;