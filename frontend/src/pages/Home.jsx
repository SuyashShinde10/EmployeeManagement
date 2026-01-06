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

          {/* Dashboard Preview Image (Placeholder) */}
          <div className="mt-5 mx-auto shadow-lg rounded-3 overflow-hidden border" style={{maxWidth: '1000px'}}>
             <div className="bg-light border-bottom px-3 py-2 d-flex gap-2">
                <div className="rounded-circle bg-danger" style={{width:10, height:10}}></div>
                <div className="rounded-circle bg-warning" style={{width:10, height:10}}></div>
                <div className="rounded-circle bg-success" style={{width:10, height:10}}></div>
             </div>
             <div className="bg-white p-5 text-center text-muted" style={{minHeight: '400px'}}>
                <h4 className="mt-5">📊 Interactive Dashboard Preview</h4>
                <p>Imagine your task board here</p>
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