import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api';
import { toast } from 'react-toastify';

const Analytics = () => {
  const [range, setRange] = useState('monthly'); // 'weekly' | 'monthly' | 'annually'
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const role = localStorage.getItem('role');

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const endpoint = role === 'PM' 
        ? `/analytics/pm?range=${range}`
        : `/analytics/employee?range=${range}`;

      const res = await api.get(endpoint);
      setData(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load analytics data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [range]);

  if (loading && !data) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
        <Navbar />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading Analytics...</span>
          </div>
        </div>
      </div>
    );
  }

  // Fallbacks in case fetch fails
  const summary = data?.summary || {};
  const trend = data?.trend || [];
  const leaderboard = data?.leaderboard || [];
  const insight = data?.insight || '';

  // Render SVG Line Chart Helper
  const renderSVGChart = () => {
    if (trend.length === 0) return null;

    const width = 600;
    const height = 200;
    const padding = 30;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const maxVal = Math.max(...trend.map(t => Math.max(t.completed, t.created, 1)), 4);

    const getX = (index) => padding + (index / (trend.length - 1)) * chartWidth;
    const getY = (val) => height - padding - (val / maxVal) * chartHeight;

    // Build path strings
    let completedPath = '';
    let createdPath = '';

    trend.forEach((d, idx) => {
      const cx = getX(idx);
      const cyCompleted = getY(d.completed);
      const cyCreated = getY(d.created);

      if (idx === 0) {
        completedPath = `M ${cx} ${cyCompleted}`;
        createdPath = `M ${cx} ${cyCreated}`;
      } else {
        completedPath += ` L ${cx} ${cyCompleted}`;
        createdPath += ` L ${cx} ${cyCreated}`;
      }
    });

    return (
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="compGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--success)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="var(--success)" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="createGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = padding + ratio * chartHeight;
            const labelVal = Math.round(maxVal * (1 - ratio));
            return (
              <g key={i}>
                <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="var(--border)" strokeDasharray="4 4" />
                <text x={padding - 8} y={y + 4} fill="var(--text-muted)" fontSize="10" textAnchor="end">{labelVal}</text>
              </g>
            );
          })}

          {/* Paths */}
          <path d={createdPath} fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d={completedPath} fill="none" stroke="var(--success)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

          {/* Area under completed line */}
          {trend.length > 1 && (
            <path
              d={`${completedPath} L ${getX(trend.length - 1)} ${height - padding} L ${getX(0)} ${height - padding} Z`}
              fill="url(#compGrad)"
            />
          )}

          {/* Data Points / Circles */}
          {trend.map((d, idx) => (
            <g key={idx}>
              <circle cx={getX(idx)} cy={getY(d.completed)} r="4" fill="var(--success)" stroke="var(--surface)" strokeWidth="1.5" />
              <circle cx={getX(idx)} cy={getY(d.created)} r="4" fill="var(--accent)" stroke="var(--surface)" strokeWidth="1.5" />
              {/* x-axis labels */}
              {((trend.length <= 10) || (idx % Math.ceil(trend.length / 6) === 0) || (idx === trend.length - 1)) && (
                <text x={getX(idx)} y={height - 8} fill="var(--text-muted)" fontSize="9" textAnchor="middle">
                  {d.label}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <Navbar />

      <main className="ts-container" style={{ padding: '24px 16px', maxWidth: 1200, margin: '0 auto' }}>
        {/* Title & Controls Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 24
        }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
              {role === 'PM' ? 'Team Performance Analytics' : 'My Performance Analytics'}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '4px 0 0' }}>
              Real-time insights and task metrics.
            </p>
          </div>

          {/* Timeframe Selector Button Group */}
          <div style={{
            display: 'flex',
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: 2,
            gap: 2
          }}>
            {['weekly', 'monthly', 'annually'].map(t => (
              <button
                key={t}
                onClick={() => setRange(t)}
                style={{
                  border: 'none',
                  outline: 'none',
                  cursor: 'pointer',
                  padding: '6px 16px',
                  borderRadius: 'calc(var(--radius) - 2px)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  textTransform: 'capitalize',
                  transition: 'all 0.2s',
                  background: range === t ? 'var(--surface)' : 'transparent',
                  color: range === t ? 'var(--accent)' : 'var(--text-muted)',
                  boxShadow: range === t ? '0 1px 3px rgba(0,0,0,0.05)' : 'none'
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* ─── PM VIEW ─────────────────────────────────────────────────────────── */}
        {role === 'PM' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* KPI Summary Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 16
            }}>
              <div className="ts-surface" style={{ padding: 20 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Total Company Tasks
                </span>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: '8px 0 0' }}>{summary.totalTasks || 0}</h2>
              </div>
              <div className="ts-surface" style={{ padding: 20 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Completed
                </span>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: '8px 0 0', color: 'var(--success)' }}>{summary.completed || 0}</h2>
              </div>
              <div className="ts-surface" style={{ padding: 20 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--warning)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  In Progress
                </span>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: '8px 0 0', color: 'var(--warning)' }}>{summary.inProgress || 0}</h2>
              </div>
              <div className="ts-surface" style={{ padding: 20 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--danger)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Overdue Tasks
                </span>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: '8px 0 0', color: 'var(--danger)' }}>{summary.overdue || 0}</h2>
              </div>
            </div>

            {/* Visual Trend Chart Card */}
            <div className="ts-surface" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Task Activity Trend</h3>
                <div style={{ display: 'flex', gap: 16, fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 12, height: 4, background: 'var(--accent)', borderRadius: 2 }} />
                    <span style={{ color: 'var(--text-muted)' }}>Created</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 12, height: 4, background: 'var(--success)', borderRadius: 2 }} />
                    <span style={{ color: 'var(--text-muted)' }}>Completed</span>
                  </div>
                </div>
              </div>
              {renderSVGChart()}
            </div>

            {/* Leaderboard Table */}
            <div className="ts-surface" style={{ padding: 24, overflowX: 'auto' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: 700 }}>Employee Performance Leaderboard</h3>
              
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 600 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700 }}>
                    <th style={{ padding: '12px 8px' }}>RANK</th>
                    <th style={{ padding: '12px 8px' }}>EMPLOYEE</th>
                    <th style={{ padding: '12px 8px' }}>TASKS ASSIGNED</th>
                    <th style={{ padding: '12px 8px' }}>TASKS DONE</th>
                    <th style={{ padding: '12px 8px' }}>AVG. SPEED</th>
                    <th style={{ padding: '12px 8px' }}>ON-TIME RATE</th>
                    <th style={{ padding: '12px 8px', textAlign: 'right' }}>EFFICIENCY SCORE</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((emp, index) => {
                    let scoreBadgeColor = 'var(--text-muted)';
                    let scoreBadgeBg = 'var(--surface-2)';
                    if (emp.score >= 80) {
                      scoreBadgeColor = 'var(--success)';
                      scoreBadgeBg = 'var(--success-light)';
                    } else if (emp.score >= 50) {
                      scoreBadgeColor = 'var(--warning)';
                      scoreBadgeBg = 'var(--warning-light)';
                    }

                    return (
                      <tr key={emp._id} style={{ borderBottom: '1px solid var(--border)', fontSize: '0.875rem' }} className="ts-table-row">
                        <td style={{ padding: '14px 8px', fontWeight: 700, color: index === 0 ? 'var(--accent)' : 'var(--text)' }}>
                          #{index + 1}
                        </td>
                        <td style={{ padding: '14px 8px' }}>
                          <div style={{ fontWeight: 600 }}>{emp.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{emp.email}</div>
                        </td>
                        <td style={{ padding: '14px 8px', color: 'var(--text-muted)' }}>{emp.assignedCount}</td>
                        <td style={{ padding: '14px 8px', fontWeight: 600, color: 'var(--success)' }}>{emp.completedCount}</td>
                        <td style={{ padding: '14px 8px' }}>
                          {emp.completedCount > 0 ? `${emp.avgSpeedDays} days` : '--'}
                        </td>
                        <td style={{ padding: '14px 8px', fontWeight: 600 }}>{emp.onTimeRate}%</td>
                        <td style={{ padding: '14px 8px', textAlign: 'right' }}>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: 'var(--radius)',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: scoreBadgeColor,
                            background: scoreBadgeBg
                          }}>
                            {emp.score}/100
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {leaderboard.length === 0 && (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        No employees found in this timeframe.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── EMPLOYEE VIEW ───────────────────────────────────────────────────── */}
        {role === 'Employee' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Summary metrics row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 16
            }}>
              <div className="ts-surface" style={{ padding: 20 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  My Assigned Tasks
                </span>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: '8px 0 0' }}>{summary.totalAssigned || 0}</h2>
              </div>
              <div className="ts-surface" style={{ padding: 20 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Tasks Completed
                </span>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: '8px 0 0', color: 'var(--success)' }}>{summary.completedCount || 0}</h2>
              </div>
              <div className="ts-surface" style={{ padding: 20 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Avg. Speed
                </span>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: '8px 0 0', color: 'var(--accent)' }}>
                  {summary.completedCount > 0 ? `${summary.avgSpeedDays}d` : '--'}
                </h2>
              </div>
              <div className="ts-surface" style={{ padding: 20 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  On-Time Rate
                </span>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: '8px 0 0' }}>{summary.onTimeRate || 0}%</h2>
              </div>
            </div>

            {/* Smart Productivity Insight Card */}
            {insight && (
              <div style={{
                background: 'var(--accent-light)',
                border: '1px solid var(--accent)',
                borderRadius: 'var(--radius)',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 16
              }}>
                <span style={{ fontSize: '1.5rem' }}>💡</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--accent)' }}>Productivity Insight</div>
                  <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: 'var(--text)', lineHeight: 1.4 }}>{insight}</p>
                </div>
              </div>
            )}

            {/* SVG Trend Chart Card */}
            <div className="ts-surface" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>My Completion Output</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem' }}>
                  <span style={{ width: 12, height: 4, background: 'var(--success)', borderRadius: 2 }} />
                  <span style={{ color: 'var(--text-muted)' }}>Tasks Completed</span>
                </div>
              </div>
              {renderSVGChart()}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Analytics;
