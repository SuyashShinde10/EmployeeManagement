import React, { useState, useEffect } from 'react';
// 1. Remove standard axios import
// import axios from 'axios'; 
// 2. Import your new custom instance
import api from '../utils/api'; 
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
  const role = localStorage.getItem("role");
  const companyId = localStorage.getItem("companyId");
  const userId = localStorage.getItem("userId");
  // const token = localStorage.getItem("token"); // Token is now handled automatically by api.js

  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [tasks, setTasks] = useState([]); 
  const [filters, setFilters] = useState({ search: "", status: "All" });

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        // 3. SIMPLIFIED CALL:
        // - No "http://localhost:8000/api" (api.js handles baseURL)
        // - No "headers: { Authorization... }" (api.js handles token)
        const res = await api.get(`/tasks/${companyId}`);
        setTasks(res.data);
      } catch (err) {
        if (err.response && err.response.status === 401) {
            localStorage.clear();
            navigate('/login');
        }
      }
    };
    
    // 4. Ensure companyId exists before calling
    if (companyId) fetchTasks();
  }, [refreshTrigger, companyId, navigate]);

  const refreshData = () => setRefreshTrigger(prev => prev + 1);

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(filters.search.toLowerCase());
    const matchesStatus = filters.status === "All" || task.status === filters.status;
    let isVisible = true;
    if (role === 'Employee') {
        isVisible = task.assignedTo.some(u => u._id === userId);
    }
    return matchesSearch && matchesStatus && isVisible;
  });

  return (
    <div className="bg-light min-vh-100">
      <Navbar />
      <div className="container-fluid px-5 py-4">
        <DashboardStats tasks={role === 'HR' ? tasks : filteredTasks} />

        {role === 'HR' && (
          <div className="row g-4 mb-5">
            <div className="col-lg-4 d-flex flex-column gap-4">
              <CreateEmployee />
              <CreateTask refreshTasks={refreshData} />
            </div>
            <div className="col-lg-8">
              {/* Note: You might need to update EmployeeList to use 'api' as well */}
              <EmployeeList refreshTrigger={refreshTrigger} />
            </div>
          </div>
        )}

        <div className="d-flex justify-content-between align-items-end mb-4 border-bottom pb-2">
           <h4 className="fw-bold mb-0">{role === 'HR' ? 'Company Task Board' : 'My Tasks'}</h4>
           <div className="w-50"><TaskFilters filters={filters} setFilters={setFilters} /></div>
        </div>

        <TaskList tasks={filteredTasks} onTaskUpdate={refreshData} />
      </div>
    </div>
  );
};

export default Dashboard;