import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api';
import { toast } from 'react-toastify';

import { socket, isSocketSupported } from '../socket';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [newReview, setNewReview] = useState({
    employeeId: '',
    period: '',
    rating: 5,
    feedback: ''
  });

  const role = localStorage.getItem('role');

  useEffect(() => {
    fetchReviews();
    if (role === 'PM') {
      fetchEmployees();
    }

    const handleNewReview = (review) => {
      // If we are an employee, only refresh if the review is for us
      if (role === 'Employee' && review.employee?._id !== localStorage.getItem('userId')) return;
      fetchReviews();
    };

    if (isSocketSupported()) {
      socket.on('new_review', handleNewReview);
    }

    return () => {
      if (isSocketSupported()) {
        socket.off('new_review', handleNewReview);
      }
    };
  }, [role]);

  const fetchReviews = async () => {
    try {
      const res = await api.get(role === 'PM' ? '/reviews/company' : '/reviews/me');
      setReviews(res.data);
    } catch (err) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/directory');
      setEmployees(res.data.filter(u => u.role === 'Employee'));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/reviews', newReview);
      toast.success('Review created successfully!');
      fetchReviews();
      setNewReview({ employeeId: '', period: '', rating: 5, feedback: '' });
    } catch (err) {
      toast.error('Failed to create review');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '28px 24px' }}>
        <h1 style={{ margin: '0 0 24px', fontSize: '1.5rem', color: 'var(--text)' }}>Performance Reviews</h1>
        
        {role === 'PM' && (
          <div className="ts-surface" style={{ padding: 24, marginBottom: 24 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem' }}>Create New Review</h3>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr 1fr' }}>
              <div>
                <label className="ts-label">Employee</label>
                <select className="ts-input" value={newReview.employeeId} onChange={e => setNewReview({...newReview, employeeId: e.target.value})} required>
                  <option value="">Select Employee...</option>
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>{emp.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="ts-label">Period</label>
                <input className="ts-input" placeholder="e.g. Q1 2026" value={newReview.period} onChange={e => setNewReview({...newReview, period: e.target.value})} required />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label className="ts-label">Rating (1-5)</label>
                <input type="number" min="1" max="5" className="ts-input" value={newReview.rating} onChange={e => setNewReview({...newReview, rating: e.target.value})} required />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label className="ts-label">Feedback</label>
                <textarea className="ts-input" rows="4" value={newReview.feedback} onChange={e => setNewReview({...newReview, feedback: e.target.value})} required />
              </div>
              <div style={{ gridColumn: 'span 2', textAlign: 'right' }}>
                <button type="submit" className="ts-btn ts-btn-primary">Submit Review</button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading reviews...</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {reviews.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No performance reviews found.</p>
            ) : (
              reviews.map(rev => (
                <div key={rev._id} className="ts-surface" style={{ padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div>
                      <h4 style={{ margin: '0 0 4px' }}>{role === 'PM' ? rev.employee?.name : 'My Review'} - {rev.period}</h4>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>Reviewed by {rev.reviewer?.name}</span>
                    </div>
                    <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '4px 12px', borderRadius: 20, fontWeight: 'bold' }}>
                      {rev.rating} / 5
                    </div>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text)', whiteSpace: 'pre-wrap' }}>
                    {rev.feedback}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reviews;
