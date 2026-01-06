import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const name = localStorage.getItem("name");
  const role = localStorage.getItem("role");

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white px-4 py-3 shadow-sm sticky-top">
      <div className="container-fluid">
        {/* Brand */}
        <span 
            className="navbar-brand fw-bold text-primary d-flex align-items-center gap-2" 
            style={{cursor: 'pointer', fontSize: '1.5rem'}} 
            onClick={() => navigate('/dashboard')}
        >
            ⚡ TeamSync
        </span>
        
        <div className="d-flex align-items-center">
          {/* User Profile */}
          <div 
            className="d-flex flex-column text-end me-3" 
            style={{cursor: "pointer", lineHeight: '1.2'}} 
            onClick={() => navigate('/profile')}
            title="Edit Profile"
          >
            <span className="fw-bold text-dark" style={{fontSize: '0.9rem'}}>{name}</span>
            <span className="text-muted text-uppercase" style={{fontSize: '0.65rem', letterSpacing: '0.5px'}}>{role}</span>
          </div>
          
          <button onClick={logout} className="btn btn-light text-danger fw-bold btn-sm border-0">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;