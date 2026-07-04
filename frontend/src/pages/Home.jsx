import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* HERO SECTION */}
      <section className="ts-hero-section" style={{
        padding: '80px 24px 64px',
        borderBottom: '1px solid var(--border)',
        background: 'linear-gradient(180deg, var(--surface) 0%, var(--bg) 100%)'
      }}>
        <div className="ts-hero-grid" style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
          
          {/* Left Hero Content */}
          <div>
            <div style={{
              display: 'inline-flex',
              padding: '4px 12px',
              borderRadius: '999px',
              background: 'var(--accent-light)',
              color: 'var(--accent)',
              fontSize: '0.75rem',
              fontWeight: 700,
              marginBottom: 16
            }}>
              v2.0 Security Release
            </div>
            
            <h1 className="ts-hero-h1" style={{
              fontSize: '3rem',
              fontWeight: 800,
              letterSpacing: '-1.5px',
              lineHeight: 1.1,
              color: 'var(--text)',
              margin: '0 0 16px'
            }}>
              Your team. Clear tasks. <br />
              <span style={{ color: 'var(--accent)' }}>No chaos.</span>
            </h1>
            
            <p style={{
              fontSize: '1rem',
              lineHeight: 1.6,
              color: 'var(--text-muted)',
              margin: '0 0 32px',
              maxWidth: 480
            }}>
              A clean, security-hardened task manager designed for modern teams. Secure employee onboarding, role-based workflows, and real-time completion states.
            </p>
            
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => navigate('/register')}
                className="ts-btn ts-btn-primary"
                style={{ padding: '12px 24px' }}
              >
                Get Started
              </button>
              <button
                onClick={() => navigate('/login')}
                className="ts-btn ts-btn-ghost"
                style={{ padding: '12px 24px' }}
              >
                Sign In
              </button>
            </div>
          </div>

          {/* Right Hero Content: Realistic App Mockup */}
          <div className="ts-surface" style={{
            background: 'var(--surface)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow)'
          }}>
            {/* Window Header */}
            <div style={{
              background: 'var(--surface-2)',
              borderBottom: '1px solid var(--border)',
              padding: '10px 16px',
              display: 'flex',
              gap: 6
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff5f56' }} />
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ffbd2e' }} />
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#27c93f' }} />
            </div>

            {/* Window Body Mockup */}
            <div style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)' }}>Web Redesign</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>Q1 Sprint</div>
                </div>
                <span className="ts-badge ts-badge-progress">In Progress</span>
              </div>

              {/* Fake Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Mock Card 1 */}
                <div style={{
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: 12,
                  background: 'var(--bg)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Design System</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-subtle)' }}>Priya S.</span>
                  </div>
                  <div className="ts-progress" style={{ height: 3 }}>
                    <div className="ts-progress-bar" style={{ width: '100%', background: 'var(--success)' }} />
                  </div>
                </div>

                {/* Mock Card 2 */}
                <div style={{
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: 12,
                  background: 'var(--bg)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>API Implementation</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-subtle)' }}>Rahul K.</span>
                  </div>
                  <div className="ts-progress" style={{ height: 3 }}>
                    <div className="ts-progress-bar" style={{ width: '40%', background: 'var(--warning)' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* HOW TO USE / WORKFLOW SECTION */}
      <section style={{ padding: '80px 24px', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ marginBottom: 48 }}>
            <span className="ts-label">Workflow</span>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '4px 0 0', color: 'var(--text)' }}>
              How TeamSync works
            </h2>
          </div>

          <div className="ts-steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
            {/* Step 1 */}
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--border-focus)', marginBottom: 12 }}>01</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 8px', color: 'var(--text)' }}>
                Register your Workspace
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                Project Managers sign up to create a dedicated company space. All database records and tasks will be private to your organization.
              </p>
            </div>

            {/* Step 2 */}
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--border-focus)', marginBottom: 12 }}>02</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 8px', color: 'var(--text)' }}>
                Securely Onboard Employees
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                Instead of manual password setup, the system generates a random key returned once to PM. Employees log in using this key and can update their profiles safely.
              </p>
            </div>

            {/* Step 3 */}
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--border-focus)', marginBottom: 12 }}>03</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 8px', color: 'var(--text)' }}>
                Assign & Track Tasks
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                PM creates and assigns tasks to department teams. Employees accept, update progress, and coordinate via internal task discussion threads.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CORE FEATURES GRID */}
      <section style={{ padding: '80px 24px', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ marginBottom: 48 }}>
            <span className="ts-label">Features</span>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '4px 0 0', color: 'var(--text)' }}>
              Built for real utility
            </h2>
          </div>

          <div className="ts-features-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ color: 'var(--accent)', fontWeight: 700 }}>✓</div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 4px', color: 'var(--text)' }}>
                  Role-Based Views
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                  PM accounts get administrative control over staff lists and task creation, while Employees focus purely on their active dashboard tasks.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ color: 'var(--accent)', fontWeight: 700 }}>✓</div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 4px', color: 'var(--text)' }}>
                  Bcrypt Hashed Passwords
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                  Passwords are never stored in raw text format. High salt rounds ensure state-of-the-art protection against credential harvesting.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ color: 'var(--accent)', fontWeight: 700 }}>✓</div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 4px', color: 'var(--text)' }}>
                  Interactive Task Boards
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                  Move tasks seamlessly between Pending, In Progress, and Completed status with granular, team-wide progress completion bars.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ color: 'var(--accent)', fontWeight: 700 }}>✓</div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 4px', color: 'var(--text)' }}>
                  Safe Data Restricting
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                  Server-side security rules ensure no employee can view, delete, or modify records belonging to other organizations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section style={{
        padding: '64px 24px',
        background: 'var(--accent)',
        color: '#fff',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 12px', letterSpacing: '-0.5px' }}>
            Ready to organize your team?
          </h2>
          <p style={{ fontSize: '0.95rem', margin: '0 0 24px', opacity: 0.9 }}>
            Join other workspaces coordinating their sprint goals with TeamSync.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="ts-btn"
            style={{ background: '#fff', color: 'var(--accent)', padding: '12px 28px', border: 'none' }}
          >
            Create Free Account
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;