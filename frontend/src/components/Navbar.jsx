import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const token = localStorage.getItem("token");
  const name = localStorage.getItem("name");
  const role = localStorage.getItem("role");

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const isHome = location.pathname === '/';

  return (
    <nav className={`navbar navbar-expand-lg navbar-light bg-white border-bottom px-4 py-3 sticky-top ${isHome ? 'shadow-sm' : ''}`}>
      <div className="container-fluid">
        {/* Brand */}
        <span 
            className="navbar-brand fw-bold text-primary d-flex align-items-center gap-2" 
            style={{cursor: 'pointer', fontSize: '1.5rem', letterSpacing: '-0.5px'}} 
            onClick={() => navigate(token ? '/dashboard' : '/')}
        >
            ⚡ TeamSync
        </span>
        
        {/* Mobile Toggle */}
        <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
          <div className="d-flex align-items-center gap-3">
            
            {/* LOGIC: IF LOGGED IN */}
            {token ? (
              <>
                <button 
                  className="btn btn-link text-decoration-none text-secondary fw-bold"
                  onClick={() => navigate('/dashboard')}
                >
                  Dashboard
                </button>

                <div 
                  className="d-flex flex-column text-end me-2" 
                  style={{cursor: "pointer", lineHeight: '1.2'}} 
                  onClick={() => navigate('/profile')}
                  title="Edit Profile"
                >
                  <span className="fw-bold text-dark" style={{fontSize: '0.9rem'}}>{name}</span>
                  <span className="text-muted text-uppercase" style={{fontSize: '0.65rem', letterSpacing: '0.5px'}}>{role}</span>
                </div>
                
                <button onClick={logout} className="btn btn-light text-danger fw-bold btn-sm border px-3">
                  Logout
                </button>
              </>
            ) : (
              /* LOGIC: IF NOT LOGGED IN (PUBLIC) */
              <>
                <button 
                  className="btn btn-link text-decoration-none text-secondary fw-bold"
                  onClick={() => navigate('/login')}
                >
                  Log In
                </button>
                <button 
                  className="btn btn-primary fw-bold px-4 shadow-sm"
                  style={{borderRadius: '8px'}}
                  onClick={() => navigate('/register')}
                >
                  Get Started
                </button>
              </>
            )}

          </div>
        </div>
      </div>
    </nav>
  );
};

// THIS LINE IS CRITICAL
export default Navbar;