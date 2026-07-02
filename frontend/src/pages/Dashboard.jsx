import React, { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import DashboardStats from '../components/DashboardStats';
import CreateEmployee from '../components/CreateEmployee';
import CreateTask from '../components/CreateTask';
import EmployeeList from '../components/EmployeeList';
import TaskFilters from '../components/TaskFilters';
import TaskList from '../components/TaskList';
import { socket } from '../socket';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const navigate = useNavigate();
  const role      = localStorage.getItem('role');
  const companyId = localStorage.getItem('companyId');
  const userId    = localStorage.getItem('userId');

  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [tasks, setTasks]     = useState([]);
  const [filters, setFilters] = useState({ search: '', status: 'All' });

  useEffect(() => {
    if (!companyId) return;
    const fetchTasks = async () => {
      try {
        const res = await api.get(`/tasks/${companyId}`);
        setTasks(res.data);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.clear();
          navigate('/login');
        }
      }
    };
    fetchTasks();
  }, [refreshTrigger, companyId, navigate]);

  useEffect(() => {
    if (!companyId) return;

    socket.connect();
    socket.emit('join_company', companyId);

    socket.on('task_created', (newTask) => {
      setTasks(prev => {
        if (prev.some(t => t._id === newTask._id)) return prev;
        return [...prev, newTask];
      });
      toast.info(`New task created: "${newTask.title}"`);
    });

    socket.on('task_updated', (updatedTask) => {
      setTasks(prev => {
        const exists = prev.some(t => t._id === updatedTask._id);
        const isVisible = role === 'PM' || updatedTask.assignedTo?.some(u => u._id === userId);

        if (isVisible) {
          if (exists) {
            return prev.map(t => t._id === updatedTask._id ? updatedTask : t);
          } else {
            return [...prev, updatedTask];
          }
        } else {
          return prev.filter(t => t._id !== updatedTask._id);
        }
      });
    });

    socket.on('task_deleted', (deletedTaskId) => {
      setTasks(prev => prev.filter(t => t._id !== deletedTaskId));
    });

    return () => {
      socket.off('task_created');
      socket.off('task_updated');
      socket.off('task_deleted');
      socket.disconnect();
    };
  }, [companyId, role, userId]);

  // Serverless-safe fallback: poll tasks every 5 seconds to support Vercel deployments
  useEffect(() => {
    if (!companyId) return;

    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/tasks/${companyId}`);
        setTasks(prev => {
          if (JSON.stringify(prev) !== JSON.stringify(res.data)) {
            return res.data;
          }
          return prev;
        });
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [companyId]);

  const refreshData = () => setRefreshTrigger(prev => prev + 1);

  const filteredTasks = tasks.filter(task => {
    const matchSearch = task.title.toLowerCase().includes(filters.search.toLowerCase());
    const matchStatus = filters.status === 'All' || task.status === filters.status;
    const isVisible   = role === 'PM' || task.assignedTo.some(u => u._id === userId);
    return matchSearch && matchStatus && isVisible;
  });

  const name = localStorage.getItem('name') || '';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const isPasswordTemp = localStorage.getItem('isPasswordTemp') === 'true';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />

      <div style={{ padding: '28px 32px', maxWidth: 1400, margin: '0 auto' }}>
        
        {/* Password Warning Banner */}
        {isPasswordTemp && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--accent-light)',
            border: '1px solid var(--accent)',
            color: 'var(--accent)',
            padding: '12px 18px',
            borderRadius: 'var(--radius)',
            marginBottom: 24,
            fontSize: '0.85rem',
            fontWeight: 500
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '1rem' }}>🔒</span>
              <span>You are using a temporary password. Secure your account by setting a new password.</span>
            </div>
            <button
              onClick={() => navigate('/profile')}
              style={{
                background: 'var(--accent)',
                color: '#fff',
                border: 'none',
                padding: '6px 12px',
                borderRadius: 6,
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'opacity 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
            >
              Set Password
            </button>
          </div>
        )}

        {/* Page Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text)' }}>
            {greeting}, {name.split(' ')[0]}
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            {role === 'PM' ? 'Here\'s your company overview.' : 'Here are your assigned tasks.'}
          </p>
        </div>

        {/* Stats */}
        <DashboardStats tasks={tasks} filteredTasks={filteredTasks} role={role} />

        {/* PM Management Section */}
        {role === 'PM' && (
          <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 16, marginBottom: 28 }}>
            {/* Left sidebar: forms */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <CreateEmployee onSuccess={refreshData} />
              <CreateTask refreshTasks={refreshData} />
            </div>
            {/* Right: employee directory */}
            <EmployeeList refreshTrigger={refreshTrigger} tasks={tasks} />
          </div>
        )}

        {/* Task Board */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text)' }}>
              {role === 'PM' ? 'Task Board' : 'My Tasks'}
            </h2>
          </div>
          <TaskFilters filters={filters} setFilters={setFilters} />
        </div>

        <TaskList tasks={filteredTasks} onTaskUpdate={refreshData} />
      </div>
    </div>
  );
};

export default Dashboard;