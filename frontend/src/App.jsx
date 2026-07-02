import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Lazy Load Pages
const Home = lazy(() => import('./pages/Home')); // New Landing Page
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const TaskDetails = lazy(() => import('./pages/TaskDetails'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Directory = lazy(() => import('./pages/Directory'));
const CalendarView = lazy(() => import('./pages/CalendarView'));
const Reviews = lazy(() => import('./pages/Reviews'));
const ActivityLog = lazy(() => import('./pages/ActivityLog'));

const LoadingSpinner = () => (
  <div className="d-flex justify-content-center align-items-center vh-100">
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      {/* Global Toast Notifications */}
      <ToastContainer position="top-right" autoClose={3000} />
      
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          
          {/* PUBLIC ROUTES */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* PROTECTED ROUTES */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/analytics" 
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/task/:id" 
            element={
              <ProtectedRoute>
                <TaskDetails />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/directory" 
            element={
              <ProtectedRoute>
                <Directory />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/calendar" 
            element={
              <ProtectedRoute>
                <CalendarView />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/reviews" 
            element={
              <ProtectedRoute>
                <Reviews />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/activity" 
            element={
              <ProtectedRoute>
                <ActivityLog />
              </ProtectedRoute>
            } 
          />
          
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;