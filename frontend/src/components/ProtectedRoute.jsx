import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Check if user is logged in
  const userId = localStorage.getItem("userId");
  const companyId = localStorage.getItem("companyId");

  if (!userId || !companyId) {
    // If no credentials, force redirect to Login
    return <Navigate to="/login" replace />;
  }

  // If logged in, show the page
  return children;
};

export default ProtectedRoute;