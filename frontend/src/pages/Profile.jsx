import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";

const Profile = () => {
  const userId = localStorage.getItem("userId");
  const initialName = localStorage.getItem("name");
  const role = localStorage.getItem("role");

  const [formData, setFormData] = useState({
    name: initialName || "",
    password: "",
    confirmPassword: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password && formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    try {
      const res = await axios.put(`http://localhost:8000/api/user/profile/${userId}`, {
        name: formData.name,
        password: formData.password || undefined 
      });
      
      toast.success("Profile Updated!");
      localStorage.setItem("name", res.data.user.name);
      setFormData({ ...formData, password: "", confirmPassword: "" });
      
    } catch (err) {
      toast.error("Update Failed");
    }
  };

  // Helper to get initials
  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  return (
    <>
      <Navbar />
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-5">
            <div className="card border-0 shadow-sm" style={{ borderRadius: "12px", overflow: 'hidden' }}>
              
              {/* Header / Avatar Area */}
              <div className="bg-light text-center py-5">
                <div 
                  className="rounded-circle bg-white d-flex justify-content-center align-items-center mx-auto shadow-sm"
                  style={{ width: "80px", height: "80px", fontSize: "2rem", fontWeight: "bold", color: "#4F46E5" }}
                >
                  {getInitials(formData.name)}
                </div>
                <h4 className="mt-3 mb-0 fw-bold">{formData.name}</h4>
                <span className="badge bg-secondary opacity-75 mt-1 rounded-pill px-3">{role}</span>
              </div>

              <div className="card-body p-4">
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="form-label text-muted small fw-bold text-uppercase">Full Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>

                  <div className="p-3 bg-light rounded-3 mb-3">
                    <h6 className="text-dark fw-bold mb-3 small text-uppercase">Security</h6>
                    
                    <div className="mb-3">
                      <label className="form-label small text-muted">New Password</label>
                      <input 
                        type="password" 
                        className="form-control border-0 bg-white" 
                        placeholder="••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                      />
                    </div>

                    <div className="mb-1">
                      <label className="form-label small text-muted">Confirm Password</label>
                      <input 
                        type="password" 
                        className="form-control border-0 bg-white" 
                        placeholder="••••••"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      />
                    </div>
                  </div>

                  <button className="btn btn-primary w-100 py-2 fw-bold" style={{ borderRadius: "8px" }}>Save Changes</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;