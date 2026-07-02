import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={{
      background: 'var(--surface)',
      borderTop: '1px solid var(--border)',
      padding: '40px 24px 24px',
      color: 'var(--text-muted)'
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Row 1: Brand & Nav */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 20,
          paddingBottom: 24,
          borderBottom: '1px solid var(--border)'
        }}>
          <div>
            <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text)', letterSpacing: '-0.5px' }}>
              TeamSync
            </span>
            <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
              Task management for modern, high-velocity teams.
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: 24 }}>
            <Link to="/login" style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textDecoration: 'none' }}>
              Sign In
            </Link>
            <Link to="/register" style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textDecoration: 'none' }}>
              Get Started
            </Link>
          </div>
        </div>

        {/* Row 2: Copyright & Legal */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          paddingTop: 24,
          fontSize: '0.75rem',
          color: 'var(--text-subtle)'
        }}>
          <span>&copy; {new Date().getFullYear()} TeamSync. All rights reserved.</span>
          <div style={{ display: 'flex', gap: 16 }}>
            <Link to="#" style={{ color: 'var(--text-subtle)', textDecoration: 'none' }}>Privacy Policy</Link>
            <Link to="#" style={{ color: 'var(--text-subtle)', textDecoration: 'none' }}>Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;