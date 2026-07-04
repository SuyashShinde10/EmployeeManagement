import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, Menu, X } from 'lucide-react';
import api from '../api';
import { socket, isSocketSupported } from '../socket';
import { toast } from 'react-toastify';

const NAV_LINKS = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Directory', path: '/directory' },
  { label: 'Calendar', path: '/calendar' },
  { label: 'Reviews', path: '/reviews' },
  { label: 'Activity', path: '/activity' },
  { label: 'Analytics', path: '/analytics' },
];

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem('token');
  const name  = localStorage.getItem('name');
  const role  = localStorage.getItem('role');

  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const notifRef = useRef(null);

  const companyId = localStorage.getItem('companyId');

  // Close mobile nav on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  useEffect(() => {
    if (token) {
      if (isSocketSupported()) {
        socket.connect();
        socket.emit('join_company', companyId);
      }

      const fetchNotifs = async () => {
        try {
          const res = await api.get('/notifications');
          setNotifications(res.data);
        } catch (e) {
          console.error(e);
        }
      };
      fetchNotifs();
      const interval = setInterval(fetchNotifs, 10000);

      const handleNewNotif = (notif) => {
        const userId = localStorage.getItem('userId');
        if (!notif.user || notif.user === userId) {
          setNotifications((prev) => [notif, ...prev]);
          toast.info(notif.message);
        }
      };

      if (isSocketSupported()) {
        socket.on('new_notification', handleNewNotif);
      }

      return () => {
        clearInterval(interval);
        if (isSocketSupported()) {
          socket.off('new_notification', handleNewNotif);
        }
      };
    }
  }, [token, companyId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (e) { console.error(e); }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (e) { console.error(e); }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="ts-navbar">
        {/* Brand */}
        <span
          className="ts-navbar-brand"
          onClick={() => navigate(token ? '/dashboard' : '/')}
        >
          TeamSync
        </span>

        {/* Desktop Nav Links */}
        {token && (
          <div className="ts-navbar-desktop-links" style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {NAV_LINKS.map(({ label, path }) => (
              <button
                key={path}
                className="ts-btn ts-btn-ghost ts-btn-sm"
                onClick={() => navigate(path)}
                style={{
                  color: isActive(path) ? 'var(--accent)' : 'inherit',
                  fontWeight: isActive(path) ? '600' : 'normal'
                }}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Right Side */}
        <div className="ts-navbar-right">
          {token ? (
            <>
              {/* Notification Bell */}
              <div ref={notifRef} style={{ position: 'relative' }}>
                <button
                  className="ts-btn ts-btn-ghost ts-btn-sm"
                  onClick={() => setShowNotifs(!showNotifs)}
                  style={{ padding: '6px', position: 'relative' }}
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span style={{
                      position: 'absolute', top: 2, right: 2, background: 'var(--danger)', color: 'white',
                      fontSize: '10px', fontWeight: 'bold', width: 16, height: 16, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {showNotifs && (
                  <div className="ts-notif-dropdown" style={{
                    position: 'absolute', top: '100%', right: 0, marginTop: 8,
                    width: 300, background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 1000
                  }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600 }}>Notifications</span>
                      {unreadCount > 0 && (
                        <span onClick={markAllAsRead} style={{ fontSize: '0.8rem', color: 'var(--accent)', cursor: 'pointer' }}>
                          Mark all read
                        </span>
                      )}
                    </div>
                    <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                      {notifications.length === 0 ? (
                        <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                          No notifications.
                        </div>
                      ) : (
                        notifications.map(n => (
                          <div key={n._id} onClick={() => markAsRead(n._id)} style={{
                            padding: '12px 16px', borderBottom: '1px solid var(--border)', cursor: 'pointer',
                            background: n.isRead ? 'transparent' : 'var(--surface-2)'
                          }}>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text)' }}>{n.message}</p>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>
                              {new Date(n.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Chip — desktop only */}
              <div
                className="ts-user-chip ts-navbar-desktop-links"
                onClick={() => navigate('/profile')}
                title="Edit Profile"
                style={{ display: 'flex' }}
              >
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)' }}>
                  {name}
                </span>
                <span className={`ts-badge ${role === 'PM' ? 'ts-badge-pm' : 'ts-badge-emp'}`}
                      style={{ marginTop: 2 }}>
                  {role}
                </span>
              </div>

              {/* Logout — desktop only */}
              <button className="ts-btn ts-btn-ghost ts-btn-sm ts-navbar-desktop-links"
                      onClick={logout}
                      style={{ color: 'var(--danger)', display: 'inline-flex' }}>
                Logout
              </button>

              {/* Hamburger — mobile only */}
              <button className="ts-navbar-menu-btn" onClick={() => setMobileOpen(true)} aria-label="Open menu">
                <Menu size={22} />
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

      {/* Mobile Slide-Out Drawer */}
      <div className={`ts-mobile-nav-overlay${mobileOpen ? ' open' : ''}`}>
        <div className="ts-mobile-nav-backdrop" onClick={() => setMobileOpen(false)} />
        <div className="ts-mobile-nav-drawer">
          {/* Drawer Header */}
          <div className="ts-mobile-nav-header">
            <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.5px' }}>TeamSync</span>
            <button
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text-muted)' }}
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <X size={22} />
            </button>
          </div>

          {/* User Block */}
          <div className="ts-mobile-nav-body">
            <div
              className="ts-mobile-user-block"
              onClick={() => { navigate('/profile'); setMobileOpen(false); }}
            >
              <div className="ts-avatar" style={{ width: 38, height: 38, fontSize: '0.9rem' }}>
                {name?.charAt(0)}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)' }}>{name}</div>
                <span className={`ts-badge ${role === 'PM' ? 'ts-badge-pm' : 'ts-badge-emp'}`} style={{ marginTop: 2 }}>
                  {role}
                </span>
              </div>
            </div>

            {/* Nav Links */}
            {NAV_LINKS.map(({ label, path }) => (
              <button
                key={path}
                className={`ts-mobile-nav-link${isActive(path) ? ' active' : ''}`}
                onClick={() => navigate(path)}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Logout */}
          <div className="ts-mobile-nav-footer">
            <button className="ts-mobile-nav-link danger" onClick={logout} style={{ width: '100%' }}>
              Log Out
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;