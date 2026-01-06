import React, { useState } from "react";
import axios from "axios";
import { toast } from 'react-toastify';

const EditEmployeeModal = ({ employee, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: employee.name,
    email: employee.email,
    team: employee.team
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:8000/api/employee/edit/${employee._id}`, formData);
      toast.success("Employee Info Updated");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error("Update Failed");
    }
  };

  return (
    <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Edit Employee</h5>
            <button onClick={onClose} className="btn-close"></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label>Name</label>
                <input className="form-control" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="mb-3">
                <label>Email</label>
                <input className="form-control" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
              </div>
              <div className="mb-3">
                <label>Team</label>
                <select className="form-control" value={formData.team} onChange={(e) => setFormData({...formData, team: e.target.value})}>
                    <option>General</option>
                    <option>Frontend</option>
                    <option>Backend</option>
                    <option>QA</option>
                    <option>Marketing</option>
                </select>
              </div>
              <button className="btn btn-primary w-100">Save Changes</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditEmployeeModal;