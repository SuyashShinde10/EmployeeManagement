import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom"; 
import AssignTaskModal from "./AssignTaskModal";
import EditTaskModal from "./EditTaskModal";
import { toast } from "react-toastify";

const TaskList = ({ tasks, onTaskUpdate }) => {
  const navigate = useNavigate();
  const [assignModalTask, setAssignModalTask] = useState(null);
  const [editModalTask, setEditModalTask] = useState(null);
  
  const role = localStorage.getItem("role");
  const currentUserId = localStorage.getItem("userId");
  const token = localStorage.getItem("token"); // GET TOKEN

  const isOverdue = (task) => {
    if (task.status === 'Completed') return false; 
    if (!task.deadline) return false;
    return new Date() > new Date(task.deadline);
  };

  const updateStatus = async (taskId, newStatus) => {
    try {
      // SECURE: Send Token in header, remove userId from body
      await axios.put("http://localhost:8000/api/task/status", 
        { taskId, status: newStatus }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.info("Task Status Updated");
      if (onTaskUpdate) onTaskUpdate();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (taskId) => {
    if (window.confirm("Delete this task permanently?")) {
      try {
        await axios.delete(`http://localhost:8000/api/task/${taskId}`, {
           headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Task Deleted");
        if (onTaskUpdate) onTaskUpdate();
      } catch (err) {
        toast.error("Delete Failed");
      }
    }
  };

  // ... (Rest of UI is same as before) ...
  // [Paste the previous Return Statement here, it is identical visually]
  // Just ensure the buttons call updateStatus/handleDelete as defined above.

  return (
    <div className="row g-4 mt-2">
      {tasks.map((task) => {
        const isAssignedToMe = task.assignedTo.some(u => u._id === currentUserId);
        const overdue = isOverdue(task);
        const haveIFinished = task.completedBy ? task.completedBy.some(id => id === currentUserId) : false;
        let statusBadge = task.status === 'Completed' ? "bg-success" : task.status === 'In Progress' ? "bg-warning text-dark" : "bg-secondary";
        if(task.status === 'Assigned') statusBadge = "bg-info text-dark";

        return (
          <div key={task._id} className="col-md-4">
            <div className="card h-100 border-0 shadow-sm task-card" style={{borderRadius: '12px', transition: 'transform 0.2s'}}>
              <div className="card-body p-4 d-flex flex-column">
                
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <h6 className={`badge rounded-pill ${statusBadge} fw-normal px-3`}>{task.status}</h6>
                  <div className="d-flex gap-2">
                    {overdue && <span className="badge bg-danger rounded-pill">Overdue</span>}
                    {role === 'HR' && (
                      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(task._id); }} 
                        className="btn btn-sm btn-light text-danger rounded-circle p-0 d-flex align-items-center justify-content-center" 
                        style={{width: '24px', height: '24px', zIndex: 10, position: 'relative'}}>×</button>
                    )}
                  </div>
                </div>

                <h5 className="card-title fw-bold mb-2">
                    <Link to={`/task/${task._id}`} className="text-decoration-none text-dark stretched-link">{task.title}</Link>
                </h5>
                <p className="card-text text-muted small mb-4 flex-grow-1" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {task.description || "No description provided."}
                </p>

                <div className="d-flex align-items-center justify-content-between mt-auto pt-3 border-top">
                    <div className="d-flex">
                        {task.assignedTo.length > 0 ? (task.assignedTo.slice(0,3).map((u, i) => (
                                <div key={u._id} className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center border border-white border-2" 
                                     style={{width: '30px', height: '30px', fontSize: '0.7rem', marginLeft: i > 0 ? '-10px' : 0}}>{u.name.charAt(0)}</div>
                            ))) : (<span className="text-muted small fst-italic">Unassigned</span>)}
                    </div>
                    <small className={`fw-bold ${overdue ? 'text-danger' : 'text-muted'}`}>{new Date(task.deadline).toLocaleDateString()}</small>
                </div>

                <div className="mt-3 d-flex gap-2 position-relative" style={{zIndex: 2}}>
                    {role === 'HR' && (
                        <>
                            <button className="btn btn-light btn-sm flex-fill fw-bold text-secondary" onClick={() => setEditModalTask(task)}>Edit</button>
                            {task.status !== 'Completed' && <button className="btn btn-light btn-sm flex-fill fw-bold text-dark" onClick={() => setAssignModalTask(task)}>Assign</button>}
                        </>
                    )}
                    {role === 'Employee' && isAssignedToMe && (
                        <>
                            {task.status === 'Assigned' && <button className="btn btn-primary btn-sm w-100 fw-bold" onClick={() => updateStatus(task._id, 'In Progress')}>Accept & Start</button>}
                            {task.status === 'In Progress' && !haveIFinished && <button className="btn btn-outline-primary btn-sm w-100 fw-bold" onClick={() => navigate(`/task/${task._id}`)}>View Details</button>}
                            {task.status === 'In Progress' && haveIFinished && <button className="btn btn-outline-secondary btn-sm w-100 fw-bold" disabled>Waiting...</button>}
                            {task.status === 'Completed' && <button className="btn btn-success btn-sm w-100 fw-bold" disabled>Done</button>}
                        </>
                    )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
      <AssignTaskModal task={assignModalTask} onClose={() => setAssignModalTask(null)} onAssignSuccess={() => { if(onTaskUpdate) onTaskUpdate(); setAssignModalTask(null); }} />
      <EditTaskModal task={editModalTask} onClose={() => setEditModalTask(null)} onUpdateSuccess={() => { if(onTaskUpdate) onTaskUpdate(); setEditModalTask(null); }} />
      {tasks.length === 0 && <p className="text-center w-100 mt-5 text-muted">No tasks visible.</p>}
    </div>
  );
};

export default TaskList;