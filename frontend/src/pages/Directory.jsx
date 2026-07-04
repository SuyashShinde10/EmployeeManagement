import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api';
import { toast } from 'react-toastify';

const Directory = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchDirectory = async () => {
      try {
        const res = await api.get('/directory');
        setEmployees(res.data);
      } catch (err) {
        toast.error('Failed to load directory');
      } finally {
        setLoading(false);
      }
    };
    fetchDirectory();
  }, []);

  const filtered = employees.filter(emp => 
    emp.name.toLowerCase().includes(search.toLowerCase()) || 
    emp.email.toLowerCase().includes(search.toLowerCase()) ||
    emp.team.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <div className="ts-page-container" style={{ maxWidth: 960, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text)' }}>Company Directory</h1>
          <input 
            className="ts-input"
            placeholder="Search by name, email, or team..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', maxWidth: 300 }}
          />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>Loading directory...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {filtered.map(emp => (
              <div key={emp._id} className="ts-surface" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
                <div className="ts-avatar" style={{ width: 48, height: 48, fontSize: '1.2rem', flexShrink: 0 }}>
                  {emp.name.charAt(0)}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <h3 style={{ margin: '0 0 4px', fontSize: '1rem', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {emp.name}
                  </h3>
                  <p style={{ margin: '0 0 8px', fontSize: '0.8rem', color: 'var(--text-subtle)' }}>{emp.email}</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span className={`ts-badge ${emp.role === 'PM' ? 'ts-badge-pm' : 'ts-badge-emp'}`}>
                      {emp.role}
                    </span>
                    <span className="ts-badge ts-badge-progress">{emp.team}</span>
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <p style={{ color: 'var(--text-muted)' }}>No employees found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Directory;
