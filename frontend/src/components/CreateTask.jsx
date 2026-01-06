import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const CreateTask = ({ refreshTasks }) => {
  const [task, setTask] = useState({ 
    title: "", 
    description: "", 
    deadline: "" 
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const companyId = localStorage.getItem("companyId");

    try {
      await axios.post("http://localhost:8000/api/task/create", {
        ...task,
        companyId
      });
      toast.success("Task Created!");
      setTask({ title: "", description: "", deadline: "" });
      
      if(refreshTasks) refreshTasks(); 

    } catch (err) {
      console.error(err);
      toast.error("Error creating task");
    }
  };

  return (
    <div className="card border-0 shadow-sm" style={{borderRadius: '12px'}}>
      <div className="card-header bg-white border-0 pt-3 pb-0">
         <h6 className="fw-bold text-primary mb-0">✨ New Task</h6>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input 
              className="form-control bg-light border-0 py-2" 
              placeholder="What needs to be done?" 
              value={task.title}
              onChange={(e) => setTask({...task, title: e.target.value})} 
              required 
              style={{fontSize: '0.95rem'}}
            />
          </div>
          <div className="mb-3">
            <textarea 
              className="form-control bg-light border-0 py-2" 
              placeholder="Add details..." 
              rows="3"
              value={task.description}
              onChange={(e) => setTask({...task, description: e.target.value})} 
              style={{resize: 'none', fontSize: '0.9rem'}}
            />
          </div>
          
          <div className="mb-3">
            <label className="form-label small text-muted fw-bold text-uppercase">Deadline</label>
            <input 
              type="datetime-local" 
              className="form-control bg-light border-0"
              value={task.deadline}
              onChange={(e) => setTask({...task, deadline: e.target.value})}
              required
              style={{fontSize: '0.85rem'}}
            />
          </div>

          <button className="btn btn-primary w-100 fw-bold shadow-sm" style={{borderRadius: '8px'}}>Create Task</button>
        </form>
      </div>
    </div>
  );
};

export default CreateTask;