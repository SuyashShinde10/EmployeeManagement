import React, { useState } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/login', { email, password });
      if (res.data.success) {
        localStorage.setItem('token',     res.data.token);
        localStorage.setItem('userId',    res.data.userId);
        localStorage.setItem('companyId', res.data.companyId);
        localStorage.setItem('role',      res.data.role);
        localStorage.setItem('name',      res.data.name);
        localStorage.setItem('isPasswordTemp', res.data.isPasswordTemp ? 'true' : 'false');
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16
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

      {/* Brand */}
      <Link to="/" style={{ textDecoration: 'none', marginBottom: 28 }}>
        <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text)', letterSpacing: '-0.5px' }}>
          TeamSync
        </span>
      </Link>

      <div className="ts-surface" style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ padding: '24px 28px' }}>
          <h1 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 4px', color: 'var(--text)' }}>
            Welcome back
          </h1>
          <p style={{ margin: '0 0 24px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Sign in to your account
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

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="ts-label">Email</label>
              <input
                className="ts-input"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div>
              <label className="ts-label">Password</label>
              <input
                className="ts-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              className="ts-btn ts-btn-primary ts-btn-full"
              type="submit"
              disabled={loading}
              style={{ marginTop: 4 }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <div style={{ padding: '14px 28px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            New to TeamSync?{' '}
            <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Create an account
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;