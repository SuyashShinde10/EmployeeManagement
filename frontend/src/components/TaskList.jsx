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
  const token = localStorage.getItem("token"); 

  const updateStatus = async (taskId, newStatus) => {
    try {
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

  return (
    <div className="row g-4 mt-2">
      {tasks.map((task) => {
        const isAssignedToMe = task.assignedTo.some(u => u._id === currentUserId);
        const haveIFinished = task.completedBy ? task.completedBy.some(id => id === currentUserId) : false;

        // --- NEW STATUS LOGIC ---
        const isExpired = task.status !== 'Completed' && new Date() > new Date(task.deadline);
        
        let displayStatus = task.status;
        let statusBadge = "bg-secondary";

        if (task.status === 'Completed') {
            statusBadge = "bg-success";
        } else if (isExpired) {
            displayStatus = "Expired";
            statusBadge = "bg-danger"; // RED FOR EXPIRED
        } else if (task.status === 'In Progress') {
            statusBadge = "bg-warning text-dark";
        } else if (task.status === 'Assigned') {
            statusBadge = "bg-info text-dark";
        }

        return (
          <div key={task._id} className="col-md-4">
            <div 
                className="card h-100 border-0 shadow-sm task-card" 
                style={{borderRadius: '12px', transition: 'transform 0.2s'}}
            >
              <div className="card-body p-4 d-flex flex-column">
                
                {/* Header */}
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <h6 className={`badge rounded-pill ${statusBadge} fw-normal px-3`}>{displayStatus}</h6>
                  
                  <div className="d-flex gap-2">
                    {role === 'HR' && (
                      <button 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(task._id); }} 
                        className="btn btn-sm btn-light text-danger rounded-circle p-0 d-flex align-items-center justify-content-center" 
                        style={{width: '24px', height: '24px', zIndex: 10, position: 'relative'}}
                      >×</button>
                    )}
                  </div>
                </div>

                {/* Title */}
                <h5 className="card-title fw-bold mb-2">
                    <Link to={`/task/${task._id}`} className="text-decoration-none text-dark stretched-link">
                        {task.title}
                    </Link>
                </h5>
                <p className="card-text text-muted small mb-4 flex-grow-1" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {task.description || "No description provided."}
                </p>

                {/* Footer Section */}
                <div className="mt-auto pt-3 border-top">
                    
                    {/* Avatars & Deadline Date */}
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div className="d-flex">
                            {task.assignedTo.length > 0 ? (
                                task.assignedTo.slice(0,3).map((u, i) => (
                                    <div key={u._id} 
                                         className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center border border-white border-2" 
                                         style={{width: '30px', height: '30px', fontSize: '0.7rem', marginLeft: i > 0 ? '-10px' : 0}}
                                         title={u.name}>
                                        {u.name.charAt(0)}
                                    </div>
                                ))
                            ) : (
                                <span className="text-muted small fst-italic">Unassigned</span>
                            )}
                        </div>
                        <small className={`fw-bold ${isExpired ? 'text-danger' : 'text-dark'}`}>
                             Due: {new Date(task.deadline).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                        </small>
                    </div>

                    {/* Timeline Info Box */}
                    <div className={`d-flex justify-content-between p-2 rounded-3 small ${isExpired ? 'bg-danger bg-opacity-10' : 'bg-light'}`}>
                         <div className="lh-1">
                            <span className="d-block text-uppercase text-muted" style={{fontSize: '0.6rem', fontWeight: 'bold', opacity: 0.6}}>Created</span>
                            <span className="text-muted" style={{fontSize: '0.75rem'}}>{new Date(task.createdAt).toLocaleDateString()}</span>
                         </div>
                         
                         {task.status === 'Completed' && task.completedAt ? (
                             <div className="text-success text-end lh-1">
                                <span className="d-block text-uppercase" style={{fontSize: '0.6rem', fontWeight: 'bold', opacity: 0.8}}>Completed</span>
                                <span className="fw-bold" style={{fontSize: '0.75rem'}}>
                                    {new Date(task.completedAt).toLocaleDateString()}
                                </span>
                             </div>
                         ) : (
                             <div className={`text-end lh-1 ${isExpired ? 'text-danger' : 'text-muted'}`}>
                                <span className="d-block text-uppercase" style={{fontSize: '0.6rem', fontWeight: 'bold', opacity: 0.6}}>
                                    {isExpired ? 'Overdue By' : 'Time Left'}
                                </span>
                                <span className="fw-bold" style={{fontSize: '0.75rem'}}>
                                    {Math.abs(Math.ceil((new Date(task.deadline) - new Date()) / (1000 * 60 * 60 * 24)))} Days
                                </span>
                             </div>
                         )}
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-3 d-flex gap-2 position-relative" style={{zIndex: 2}}>
                    {role === 'HR' && (
                        <>
                            <button className="btn btn-light btn-sm flex-fill fw-bold text-secondary" onClick={() => setEditModalTask(task)}>Edit</button>
                            {task.status !== 'Completed' && (
                                <button className="btn btn-light btn-sm flex-fill fw-bold text-dark" onClick={() => setAssignModalTask(task)}>Assign</button>
                            )}
                        </>
                    )}
                    
                    {role === 'Employee' && isAssignedToMe && (
                        <>
                            {task.status === 'Assigned' && (
                                <button className="btn btn-primary btn-sm w-100 fw-bold" onClick={() => updateStatus(task._id, 'In Progress')}>
                                    Accept & Start
                                </button>
                            )}
                            {task.status === 'In Progress' && !haveIFinished && (
                                <button className="btn btn-outline-primary btn-sm w-100 fw-bold" onClick={() => navigate(`/task/${task._id}`)}>
                                    View Details
                                </button>
                            )}
                             {task.status === 'In Progress' && haveIFinished && (
                                <button className="btn btn-outline-secondary btn-sm w-100 fw-bold" disabled>
                                    Waiting for Team...
                                </button>
                            )}
                            {task.status === 'Completed' && (
                                <button className="btn btn-success btn-sm w-100 fw-bold" disabled>
                                    Done
                                </button>
                            )}
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