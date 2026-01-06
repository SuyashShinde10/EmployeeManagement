import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";

const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  const [task, setTask] = useState(null);
  const [newComment, setNewComment] = useState("");

  const fetchTask = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/api/task/${id}`, {
        headers: { Authorization: `Bearer ${token}` } 
      });
      setTask(res.data);
    } catch (err) {
      toast.error("Failed to load task");
    }
  };

  useEffect(() => { 
    if(token) fetchTask(); 
  }, [id, token]);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await axios.post(`http://localhost:8000/api/task/comment/${id}`, 
        { userId, text: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewComment("");
      fetchTask();
      toast.success("Posted");
    } catch (err) { toast.error("Failed"); }
  };

  const updateStatus = async (newStatus) => {
    try {
      await axios.put("http://localhost:8000/api/task/status", 
        { 
          taskId: id, 
          status: newStatus,
          userId: userId
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if(newStatus === 'Completed') toast.success("You marked this as done!");
      else toast.success("Task Started");
      
      fetchTask(); 
    } catch (err) {
      toast.error("Status update failed");
    }
  };

  if (!task) return <div className="p-5 text-center">Loading...</div>;

  const isAssignedToMe = task.assignedTo.some(u => u._id === userId);
  const haveIFinished = task.completedBy ? task.completedBy.some(u => u._id === userId) : false;

  // --- NEW EXPIRED LOGIC ---
  const isExpired = task.status !== 'Completed' && new Date() > new Date(task.deadline);
  let displayStatus = task.status;
  let statusBadge = "bg-secondary";

  if (task.status === 'Completed') statusBadge = "bg-success";
  else if (isExpired) {
      displayStatus = "Expired";
      statusBadge = "bg-danger";
  } else if (task.status === 'In Progress') statusBadge = "bg-warning text-dark";


  return (
    <>
      <Navbar />
      <div className="container mt-4 mb-5">
        
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-3">
            <button onClick={() => navigate('/dashboard')} className="btn btn-link text-muted text-decoration-none ps-0">
                ← Back to Board
            </button>

            {role === 'Employee' && isAssignedToMe && (
                <div>
                    {task.status === 'Assigned' && (
                        <button className="btn btn-primary fw-bold" onClick={() => updateStatus('In Progress')}>
                            Accept & Start Task
                        </button>
                    )}
                    
                    {task.status === 'In Progress' && !haveIFinished && (
                        <button className="btn btn-success fw-bold px-4" onClick={() => updateStatus('Completed')}>
                            ✅ Mark My Part as Done
                        </button>
                    )}

                    {task.status === 'In Progress' && haveIFinished && (
                        <button className="btn btn-outline-secondary fw-bold px-4" disabled>
                            ⏳ Waiting for team...
                        </button>
                    )}
                </div>
            )}
        </div>

        <div className="row g-4">
          
          <div className="col-lg-8">
            {/* Task Info */}
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
              <div className="d-flex justify-content-between align-items-start">
                <h2 className="fw-bold mb-3">{task.title}</h2>
                <span className={`badge px-3 py-2 rounded-pill ${statusBadge}`}>
                    {displayStatus}
                </span>
              </div>
              <p className="text-muted lh-lg" style={{whiteSpace: 'pre-wrap'}}>{task.description}</p>
              
              <div className="mt-4 pt-4 border-top">
                <label className="text-uppercase small text-muted fw-bold mb-2">Assignees</label>
                <div className="d-flex flex-wrap gap-2">
                  {task.assignedTo.map(u => {
                      const userDone = task.completedBy.some(c => c._id === u._id);
                      return (
                        <div key={u._id} className={`badge px-3 py-2 rounded-pill fw-normal ${userDone ? 'bg-success text-white' : 'bg-primary bg-opacity-10 text-primary'}`}>
                          {u.name} {userDone && "✓"}
                        </div>
                      );
                  })}
                </div>
              </div>
            </div>

            {/* Chat UI */}
            {role !== 'HR' && (
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="card-header bg-white p-4 border-bottom">
                    <h5 className="fw-bold mb-0">Discussion</h5>
                </div>
                <div className="card-body p-4 bg-light">
                    <div className="d-flex flex-column gap-3 mb-4">
                    {task.comments.map((c, i) => (
                        <div key={i} className="d-flex gap-3">
                        <div className="rounded-circle bg-white border d-flex align-items-center justify-content-center shadow-sm" style={{width: 40, height: 40, flexShrink: 0}}>
                            {c.user?.name.charAt(0)}
                        </div>
                        <div>
                            <div className="bg-white p-3 rounded-3 shadow-sm" style={{borderTopLeftRadius: 0}}>
                            <div className="d-flex align-items-center gap-2 mb-1">
                                <span className="fw-bold small">{c.user?.name}</span>
                                <span className="text-muted" style={{fontSize: '0.7rem'}}>{new Date(c.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                            </div>
                            <p className="mb-0 text-dark small">{c.text}</p>
                            </div>
                        </div>
                        </div>
                    ))}
                    {task.comments.length === 0 && <div className="text-center text-muted py-4">No comments yet</div>}
                    </div>
                    
                    <form onSubmit={handleComment} className="position-relative">
                    <input 
                        className="form-control py-3 ps-4 pe-5 rounded-pill border-0 shadow-sm" 
                        placeholder="Type a message..." 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                    />
                    <button className="btn btn-primary rounded-circle position-absolute top-50 end-0 translate-middle-y me-2 d-flex align-items-center justify-content-center" style={{width: 35, height: 35}}>
                        ➤
                    </button>
                    </form>
                </div>
                </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 p-4">
              <h6 className="text-uppercase small text-muted fw-bold mb-3">Timeline</h6>
              <div className="mb-3">
                <span className="d-block small text-muted">Deadline</span>
                <span className={`fw-bold ${isExpired ? 'text-danger' : 'text-dark'}`}>{new Date(task.deadline).toLocaleDateString()}</span>
              </div>
              <div className="mb-3">
                <span className="d-block small text-muted">Created</span>
                <span className="fw-bold text-dark">{new Date(task.createdAt).toLocaleDateString()}</span>
              </div>
              
              <div className="mt-4">
                 <span className="d-block small text-muted mb-1">Team Progress</span>
                 <div className="progress" style={{height: '8px'}}>
                    <div 
                        className="progress-bar bg-success" 
                        style={{width: `${(task.completedBy.length / task.assignedTo.length) * 100}%`}}
                    ></div>
                 </div>
                 <small className="text-muted mt-1 d-block">{task.completedBy.length} of {task.assignedTo.length} members finished</small>
              </div>

            </div>
          </div>
          
        </div>
      </div>
    </>
  );
};

export default TaskDetails;