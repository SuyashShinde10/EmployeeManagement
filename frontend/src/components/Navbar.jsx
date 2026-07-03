import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell } from 'lucide-react';
import api from '../api';
import { socket, isSocketSupported } from '../socket';
import { toast } from 'react-toastify';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem('token');
  const name  = localStorage.getItem('name');
  const role  = localStorage.getItem('role');

  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef(null);

  const companyId = localStorage.getItem('companyId');

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
      const interval = setInterval(fetchNotifs, 10000); // Poll every 10s
      
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
    } catch (e) {
      console.error(e);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

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
      <div className="ts-navbar-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {token ? (
          <>
            <button
              className="ts-btn ts-btn-ghost ts-btn-sm"
              onClick={() => navigate('/directory')}
              style={{
                color: location.pathname === '/directory' ? 'var(--accent)' : 'inherit',
                fontWeight: location.pathname === '/directory' ? '600' : 'normal'
              }}
            >
              Directory
            </button>
            <button
              className="ts-btn ts-btn-ghost ts-btn-sm"
              onClick={() => navigate('/calendar')}
              style={{
                color: location.pathname === '/calendar' ? 'var(--accent)' : 'inherit',
                fontWeight: location.pathname === '/calendar' ? '600' : 'normal'
              }}
            >
              Calendar
            </button>
            <button
              className="ts-btn ts-btn-ghost ts-btn-sm"
              onClick={() => navigate('/reviews')}
              style={{
                color: location.pathname === '/reviews' ? 'var(--accent)' : 'inherit',
                fontWeight: location.pathname === '/reviews' ? '600' : 'normal'
              }}
            >
              Reviews
            </button>
            <button
              className="ts-btn ts-btn-ghost ts-btn-sm"
              onClick={() => navigate('/activity')}
              style={{
                color: location.pathname === '/activity' ? 'var(--accent)' : 'inherit',
                fontWeight: location.pathname === '/activity' ? '600' : 'normal'
              }}
            >
              Activity
            </button>
            <button
              className="ts-btn ts-btn-ghost ts-btn-sm"
              onClick={() => navigate('/dashboard')}
              style={{
                color: location.pathname === '/dashboard' ? 'var(--accent)' : 'inherit',
                fontWeight: location.pathname === '/dashboard' ? '600' : 'normal'
              }}
            >
              Dashboard
            </button>

            <button
              className="ts-btn ts-btn-ghost ts-btn-sm"
              onClick={() => navigate('/analytics')}
              style={{
                color: location.pathname === '/analytics' ? 'var(--accent)' : 'inherit',
                fontWeight: location.pathname === '/analytics' ? '600' : 'normal'
              }}
            >
              Analytics
            </button>

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

              {/* Dropdown */}
              {showNotifs && (
                <div style={{
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

            <div
              className="ts-user-chip"
              onClick={() => navigate('/profile')}
              title="Edit Profile"
            >
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)' }}>
                {name}
              </span>
              <span className={`ts-badge ${role === 'PM' ? 'ts-badge-pm' : 'ts-badge-emp'}`}
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