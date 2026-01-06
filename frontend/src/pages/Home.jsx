import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="d-flex flex-column min-vh-100 font-sans">
      <Navbar />

      {/* HERO SECTION */}
      <section className="py-5 bg-light" style={{background: 'linear-gradient(180deg, #ffffff 0%, #f3f4f6 100%)'}}>
        <div className="container text-center py-5">
          <div className="d-inline-block px-3 py-1 mb-3 rounded-pill bg-primary bg-opacity-10 text-primary small fw-bold">
            🚀 v2.0 is now live
          </div>
          <h1 className="display-3 fw-bold mb-3 text-dark tracking-tight">
            Manage your team with <br/>
            <span className="text-primary">clarity and focus.</span>
          </h1>
          <p className="lead text-muted mb-5 mx-auto" style={{maxWidth: '600px'}}>
            TeamSync connects your workflows to your outcomes. The only task management platform designed for modern, high-velocity teams.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <button onClick={() => navigate('/register')} className="btn btn-primary btn-lg fw-bold px-5 shadow-sm" style={{borderRadius: '10px'}}>
                Start for Free
            </button>
            <button onClick={() => navigate('/login')} className="btn btn-white bg-white text-dark border btn-lg fw-bold px-5 shadow-sm" style={{borderRadius: '10px'}}>
                Live Demo
            </button>
          </div>

          {/* VISUAL DASHBOARD PREVIEW */}
          <div className="mt-5 mx-auto shadow-lg rounded-3 overflow-hidden border bg-white" style={{maxWidth: '1000px'}}>
             {/* Fake Browser Bar */}
             <div className="bg-light border-bottom px-3 py-2 d-flex gap-2">
                <div className="rounded-circle bg-danger" style={{width:10, height:10}}></div>
                <div className="rounded-circle bg-warning" style={{width:10, height:10}}></div>
                <div className="rounded-circle bg-success" style={{width:10, height:10}}></div>
             </div>

             {/* Mock Dashboard UI */}
             <div className="p-4 text-start" style={{minHeight: '400px'}}>
                
                {/* Mock Header */}
                <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                    <div>
                        <h5 className="fw-bold mb-0 text-dark">Website Redesign</h5>
                        <small className="text-muted">Software Project • Q1 2026</small>
                    </div>
                    <div className="d-flex align-items-center">
                        <small className="text-muted me-2 small">Team:</small>
                        <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center border border-white" style={{width:32, height:32, fontSize:'0.7rem', fontWeight:'bold'}}>JD</div>
                        <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center border border-white" style={{width:32, height:32, fontSize:'0.7rem', fontWeight:'bold', marginLeft: -8}}>AS</div>
                        <div className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center border border-white" style={{width:32, height:32, fontSize:'0.7rem', fontWeight:'bold', marginLeft: -8}}>+3</div>
                    </div>
                </div>

                {/* Mock Kanban Board */}
                <div className="row g-3">
                    {/* Column 1: Pending */}
                    <div className="col-md-4">
                        <div className="bg-light p-3 rounded-3 h-100">
                            <h6 className="text-uppercase small fw-bold text-secondary mb-3">To Do (2)</h6>
                            
                            {/* Card 1 */}
                            <div className="bg-white p-3 rounded-3 shadow-sm mb-3 border-start border-4 border-secondary card-hover">
                                <div className="d-flex justify-content-between mb-2">
                                  <span className="badge bg-secondary text-white" style={{fontSize:'0.6rem'}}>Pending</span>
                                  <small className="text-muted" style={{fontSize:'0.7rem'}}>#TS-101</small>
                                </div>
                                <h6 className="fw-bold text-dark mb-1" style={{fontSize:'0.9rem'}}>Design System</h6>
                                <p className="text-muted small mb-2" style={{fontSize: '0.75rem', lineHeight: '1.3'}}>Create color palette and typography components.</p>
                                <div className="d-flex justify-content-between align-items-center">
                                    <small className="text-muted" style={{fontSize:'0.7rem'}}>📅 Tomorrow</small>
                                    <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{width:20, height:20, fontSize:'0.5rem'}}>JD</div>
                                </div>
                            </div>
                            
                            {/* Card 2 */}
                            <div className="bg-white p-3 rounded-3 shadow-sm border-start border-4 border-secondary card-hover">
                                <span className="badge bg-secondary text-white mb-2" style={{fontSize:'0.6rem'}}>Pending</span>
                                <h6 className="fw-bold text-dark mb-1" style={{fontSize:'0.9rem'}}>Client Meeting</h6>
                                <div className="d-flex justify-content-between align-items-center mt-2">
                                    <small className="text-danger fw-bold" style={{fontSize:'0.7rem'}}>! Overdue</small>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Column 2: In Progress */}
                    <div className="col-md-4">
                        <div className="bg-light p-3 rounded-3 h-100">
                            <h6 className="text-uppercase small fw-bold text-warning mb-3">In Progress (1)</h6>
                            {/* Card 3 */}
                            <div className="bg-white p-3 rounded-3 shadow-sm border-start border-4 border-warning card-hover">
                                <span className="badge bg-warning text-dark mb-2" style={{fontSize:'0.6rem'}}>In Progress</span>
                                <h6 className="fw-bold text-dark mb-1" style={{fontSize:'0.9rem'}}>API Integration</h6>
                                <p className="text-muted small mb-2" style={{fontSize:'0.75rem', lineHeight:'1.3'}}>Connect frontend with new endpoints.</p>
                                <div className="d-flex justify-content-between align-items-center mt-2">
                                    <small className="text-dark fw-bold" style={{fontSize:'0.7rem'}}>⏳ 2 days left</small>
                                    <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center" style={{width:20, height:20, fontSize:'0.5rem'}}>AS</div>
                                </div>
                            </div>
                        </div>
                    </div>

                     {/* Column 3: Completed */}
                     <div className="col-md-4">
                        <div className="bg-light p-3 rounded-3 h-100">
                            <h6 className="text-uppercase small fw-bold text-success mb-3">Completed (1)</h6>
                            {/* Card 4 */}
                            <div className="bg-white p-3 rounded-3 shadow-sm border-start border-4 border-success card-hover">
                                <span className="badge bg-success text-white mb-2" style={{fontSize:'0.6rem'}}>Done</span>
                                <h6 className="fw-bold text-dark mb-1" style={{fontSize:'0.9rem'}}>Project Setup</h6>
                                <div className="d-flex justify-content-between align-items-center mt-2">
                                    <small className="text-success fw-bold" style={{fontSize:'0.7rem'}}>✓ Finished</small>
                                    <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{width:20, height:20, fontSize:'0.5rem'}}>JD</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-5 bg-white">
        <div className="container py-5">
            <div className="row g-5">
                {[
                    { title: "Real-time Tracking", desc: "See who is working on what, instantly. No more status meetings.", icon: "⚡" },
                    { title: "Secure Collaboration", desc: "Enterprise-grade security with Role-Based Access Control.", icon: "🔒" },
                    { title: "Smart Workflows", desc: "Automate task assignments and completion logic effortlessly.", icon: "⚙️" }
                ].map((feature, i) => (
                    <div className="col-md-4" key={i}>
                        <div className="p-4 rounded-4 bg-light h-100 border-0">
                            <div className="fs-1 mb-3">{feature.icon}</div>
                            <h4 className="fw-bold text-dark">{feature.title}</h4>
                            <p className="text-muted">{feature.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-5 text-white" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
         <div className="container text-center py-5">
            <h2 className="fw-bold mb-3 display-5">Ready to sync your team?</h2>
            <p className="lead mb-4 opacity-75">Join 10,000+ teams organizing their work with TeamSync.</p>
            <button onClick={() => navigate('/register')} className="btn btn-light text-primary btn-lg fw-bold px-5" style={{borderRadius: '10px'}}>
                Get Started Now
            </button>
         </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;