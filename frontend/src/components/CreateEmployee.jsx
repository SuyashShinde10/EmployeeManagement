import React, { useState } from "react";
// 1. Use your new api instance
import api from "../api";
import { toast } from "react-toastify";

const CreateEmployee = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    team: "General"
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const companyId = localStorage.getItem("companyId");
    // Token is now handled automatically by api.js

    try {
      // 2. Simplified API call
      await api.post("/create-employee", {
        ...formData,
        hrCompanyId: companyId
      });
      
      toast.success("Employee Added!");
      setFormData({ name: "", email: "", password: "", team: "General" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Error creating employee");
    }
  };

  return (
    <div className="card border-0 shadow-sm mb-4" style={{borderRadius: '12px'}}>
      <div className="card-header bg-white border-0 pt-3 pb-0">
         <h6 className="fw-bold text-dark mb-0">👤 Onboard Employee</h6>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="row g-2">
            <div className="col-md-6 mb-2">
              <label className="small text-muted fw-bold ms-1">Name</label>
              <input 
                className="form-control bg-light border-0" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                required 
              />
            </div>
            <div className="col-md-6 mb-2">
              <label className="small text-muted fw-bold ms-1">Email</label>
              <input 
                className="form-control bg-light border-0" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
                required 
              />
            </div>
            <div className="col-md-6 mb-2">
               <label className="small text-muted fw-bold ms-1">Password</label>
              <input 
                className="form-control bg-light border-0" 
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
                required 
              />
            </div>
            <div className="col-md-6 mb-2">
               <label className="small text-muted fw-bold ms-1">Department</label>
              <select 
                className="form-select bg-light border-0" 
                value={formData.team}
                onChange={(e) => setFormData({...formData, team: e.target.value})}
              >
                <option>General</option>
                <option>Frontend</option>
                <option>Backend</option>
                <option>QA</option>
                <option>Marketing</option>
              </select>
            </div>
          </div>
          <button className="btn btn-dark w-100 mt-3 fw-bold" style={{borderRadius: '8px'}}>Add to Team</button>
        </form>
      </div>
    </div>
  );
};

export default CreateEmployee;