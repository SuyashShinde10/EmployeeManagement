import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem('token');
  const name  = localStorage.getItem('name');
  const role  = localStorage.getItem('role');

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="ts-navbar">
      {/* Brand */}
      <span
        className="ts-navbar-brand"
        onClick={() => navigate(token ? '/dashboard' : '/')}
      >
        TeamSync
      </span>

      {/* Right side */}
      <div className="ts-navbar-right">
        {token ? (
          <>
            <button
              className="ts-btn ts-btn-ghost ts-btn-sm"
              onClick={() => navigate('/dashboard')}
            >
              Dashboard
            </button>

            <div
              className="ts-user-chip"
              onClick={() => navigate('/profile')}
              title="Edit Profile"
            >
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)' }}>
                {name}
              </span>
              <span className={`ts-badge ${role === 'HR' ? 'ts-badge-hr' : 'ts-badge-emp'}`}
                    style={{ marginTop: 2 }}>
                {role}
              </span>
            </div>

            <button className="ts-btn ts-btn-ghost ts-btn-sm" onClick={logout}
                    style={{ color: 'var(--danger)' }}>
              Logout
            </button>
          </>
        ) : (
          <>
            <button className="ts-btn ts-btn-ghost ts-btn-sm" onClick={() => navigate('/login')}>
              Log In
            </button>
            <button className="ts-btn ts-btn-primary ts-btn-sm" onClick={() => navigate('/register')}>
              Get Started
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;