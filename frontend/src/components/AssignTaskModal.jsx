import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AssignTaskModal = ({ task, onClose, onAssignSuccess }) => {
  const [query, setQuery] = useState("");
  const [employees, setEmployees] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [error, setError] = useState("");

  // 1. ALWAYS Run Hooks (Do not put returns before this)
  useEffect(() => {
    const searchEmployees = async () => {
      const companyId = localStorage.getItem("companyId");
      try {
          // Only call API if we have a companyId (prevents 400 errors on empty state)
          if(companyId) {
             const res = await axios.get(`http://localhost:8000/api/employees/search?companyId=${companyId}&query=${query}`);
             setEmployees(res.data);
          }
      } catch (err) {
          console.error(err);
      }
    };
    
    const timeout = setTimeout(searchEmployees, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  // 2. Safety Check (Must be AFTER hooks)
  if (!task) return null;

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(empId => empId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleAssign = async () => {
    const companyId = localStorage.getItem("companyId");
    try {
      await axios.put("http://localhost:8000/api/task/assign", {
        taskId: task._id,
        employeeIds: selectedIds,
        companyId
      });
      toast.success("Assigned successfully!");
      onAssignSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Assignment Failed");
    }
  };

  return (
    <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: 'blur(4px)', zIndex: 1050 }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg" style={{borderRadius: '16px'}}>
          
          <div className="modal-header border-0 pb-0">
            <div>
                <h5 className="modal-title fw-bold">Assign Task</h5>
                <p className="text-muted small mb-0">
                    Select team members for <span className="text-dark fw-bold">"{task.title}"</span>
                </p>
            </div>
            <button onClick={onClose} className="btn-close"></button>
          </div>
          
          <div className="modal-body">
            {error && <div className="alert alert-danger py-2 small">{error}</div>}

            <div className="bg-light p-2 rounded-3 mb-3">
                <input 
                  type="text" 
                  className="form-control border-0 bg-transparent" 
                  placeholder="🔍 Search by name or team..." 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoFocus
                />
            </div>

            <div className="list-group list-group-flush border rounded-3" style={{ maxHeight: "250px", overflowY: "auto" }}>
              {employees.map(emp => (
                <label key={emp._id} className="list-group-item list-group-item-action d-flex align-items-center gap-3 border-0 py-3" style={{cursor: 'pointer'}}>
                  <input 
                    type="checkbox" 
                    className="form-check-input mt-0" 
                    style={{width: '1.2em', height: '1.2em'}}
                    onChange={() => toggleSelect(emp._id)}
                    checked={selectedIds.includes(emp._id)}
                  />
                  <div className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center fw-bold" style={{width: 35, height: 35}}>
                     {emp.name.charAt(0)}
                  </div>
                  <div className="flex-grow-1">
                    <div className="fw-bold text-dark" style={{fontSize: '0.95rem'}}>{emp.name}</div>
                    <div className="text-muted small">{emp.team}</div>
                  </div>
                </label>
              ))}
              {employees.length === 0 && <p className="text-center text-muted my-3 small">No active employees found.</p>}
            </div>

            <div className="text-end mt-2">
                 <small className="text-muted">{selectedIds.length} selected</small>
            </div>

          </div>
          
          <div className="modal-footer border-0 pt-0">
            <button onClick={onClose} className="btn btn-light text-muted fw-bold">Cancel</button>
            <button onClick={handleAssign} className="btn btn-primary fw-bold px-4" disabled={selectedIds.length === 0}>
              Confirm Assignment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignTaskModal;