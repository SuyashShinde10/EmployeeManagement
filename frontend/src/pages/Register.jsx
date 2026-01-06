import React, { useState } from "react";
// 1. IMPORT THE HELPER (This handles the URL automatically)
import api from "../api"; 
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: "",
    hrName: "",
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 2. USE 'api.post' AND REMOVE THE URL
      // The api.js file automatically inserts the Vercel Backend URL
      await api.post("/register-company", formData);
      
      alert("Registration Successful! Please Login.");
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Registration Failed");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100" 
         style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
      <div className="card border-0 shadow-lg" style={{ width: "450px", borderRadius: "16px", background: "rgba(255, 255, 255, 0.95)" }}>
        <div className="card-body p-5 position-relative">
          
          <div className="position-absolute top-0 start-0 p-4">
             <Link to="/" className="text-decoration-none text-muted small fw-bold">← Home</Link>
          </div>

          <div className="text-center mb-4 mt-3">
            <h3 className="fw-bold text-dark mb-1">Get Started</h3>
            <p className="text-muted small">Set up your company workspace</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label text-secondary small fw-bold">Company Name</label>
                <input name="companyName" className="form-control bg-light border-0" onChange={handleChange} required />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label text-secondary small fw-bold">Your Name</label>
                <input name="hrName" className="form-control bg-light border-0" onChange={handleChange} required />
              </div>
            </div>
            
            <div className="mb-3">
              <label className="form-label text-secondary small fw-bold">Work Email</label>
              <input name="email" type="email" className="form-control bg-light border-0" onChange={handleChange} required />
            </div>
            <div className="mb-4">
              <label className="form-label text-secondary small fw-bold">Password</label>
              <input name="password" type="password" className="form-control bg-light border-0" onChange={handleChange} required />
            </div>
            
            <button className="btn btn-dark w-100 py-2 fw-bold shadow-sm" style={{ borderRadius: "8px" }}>Create Account</button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-muted small">
              Already have an account? <Link to="/login" className="text-decoration-none fw-bold text-dark">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;