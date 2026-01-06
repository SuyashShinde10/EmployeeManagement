import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const EditTaskModal = ({ task, onClose, onUpdateSuccess }) => {
  // --- SAFETY CHECK: PREVENTS CRASH IF TASK IS NULL ---
  if (!task) return null;

  const [formData, setFormData] = useState({
    title: task.title || "",
    description: task.description || "",
    // Safe date formatting
    deadline: task.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : "" 
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:8000/api/task/edit/${task._id}`, formData);
      toast.success("Task Updated!");
      onUpdateSuccess();
      onClose();
    } catch (err) {
      toast.error("Update Failed");
      console.error(err);
    }
  };

  return (
    <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: 'blur(4px)', zIndex: 1050 }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg" style={{borderRadius: '16px'}}>
          
          {/* Header */}
          <div className="modal-header border-0 pb-0">
            <div>
                <h5 className="modal-title fw-bold">Edit Task</h5>
                <p className="text-muted small mb-0">Update details for <span className="fw-bold text-dark">"{task.title}"</span></p>
            </div>
            <button onClick={onClose} className="btn-close"></button>
          </div>

          {/* Body */}
          <div className="modal-body p-4">
            <form onSubmit={handleSubmit}>
              
              <div className="mb-3">
                <label className="form-label small text-muted fw-bold text-uppercase">Title</label>
                <input 
                  className="form-control bg-light border-0 py-2" 
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  style={{fontSize: '0.95rem'}}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small text-muted fw-bold text-uppercase">Description</label>
                <textarea 
                  className="form-control bg-light border-0 py-2" 
                  rows="4"
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  style={{resize: 'none', fontSize: '0.95rem'}}
                />
              </div>

              <div className="mb-4">
                <label className="form-label small text-muted fw-bold text-uppercase">Deadline</label>
                <input 
                  type="datetime-local" 
                  className="form-control bg-light border-0" 
                  value={formData.deadline} 
                  onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                  required
                />
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button type="button" onClick={onClose} className="btn btn-light text-muted fw-bold">Cancel</button>
                <button type="submit" className="btn btn-primary px-4 fw-bold">Save Changes</button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditTaskModal;