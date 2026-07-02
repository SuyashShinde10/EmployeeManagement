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

  const refreshData = () => setRefreshTrigger(prev => prev + 1);

  const filteredTasks = tasks.filter(task => {
    const matchSearch = task.title.toLowerCase().includes(filters.search.toLowerCase());
    const matchStatus = filters.status === 'All' || task.status === filters.status;
    const isVisible   = role === 'HR' || task.assignedTo.some(u => u._id === userId);
    return matchSearch && matchStatus && isVisible;
  });

  const name = localStorage.getItem('name') || '';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />

      <div style={{ padding: '28px 32px', maxWidth: 1400, margin: '0 auto' }}>

        {/* Page Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text)' }}>
            {greeting}, {name.split(' ')[0]}
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            {role === 'HR' ? 'Here\'s your company overview.' : 'Here are your assigned tasks.'}
          </p>
        </div>

        {/* Stats */}
        <DashboardStats tasks={role === 'HR' ? tasks : filteredTasks} />

        {/* HR Management Section */}
        {role === 'HR' && (
          <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 16, marginBottom: 28 }}>
            {/* Left sidebar: forms */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <CreateEmployee onSuccess={refreshData} />
              <CreateTask refreshTasks={refreshData} />
            </div>
            {/* Right: employee directory */}
            <EmployeeList refreshTrigger={refreshTrigger} />
          </div>
        )}

        {/* Task Board */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text)' }}>
              {role === 'HR' ? 'Task Board' : 'My Tasks'}
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