import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8000/api/login", { email, password });
      
      if (res.data.success) {
        localStorage.setItem("token", res.data.token); 
        localStorage.setItem("userId", res.data.userId);
        localStorage.setItem("companyId", res.data.companyId);
        localStorage.setItem("role", res.data.role);
        localStorage.setItem("name", res.data.name);

        navigate("/dashboard");
      }
    } catch (err) {
      alert("Invalid Credentials");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100" 
         style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
      <div className="card border-0 shadow-lg" style={{ width: "400px", borderRadius: "16px", background: "rgba(255, 255, 255, 0.95)" }}>
        <div className="card-body p-5 position-relative">
          
          {/* BACK TO HOME LINK */}
          <div className="position-absolute top-0 start-0 p-4">
            <Link to="/" className="text-decoration-none text-muted small fw-bold">← Home</Link>
          </div>

          <div className="text-center mb-4 mt-3">
            <h3 className="fw-bold text-dark mb-1">Welcome Back</h3>
            <p className="text-muted small">Log in to manage your team</p>
          </div>
          
          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="form-label text-secondary small fw-bold text-uppercase">Email</label>
              <input type="email" className="form-control form-control-lg bg-light border-0" onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="mb-4">
              <label className="form-label text-secondary small fw-bold text-uppercase">Password</label>
              <input type="password" className="form-control form-control-lg bg-light border-0" onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button className="btn btn-primary w-100 py-2 fw-bold shadow-sm" style={{ borderRadius: "8px" }}>Sign In</button>
          </form>
          
          <div className="mt-4 text-center">
            <p className="text-muted small">New to TeamSync? <Link to="/register" className="text-decoration-none fw-bold text-primary">Create Account</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};
  
export default Login;