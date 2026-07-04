import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api';
import { toast } from 'react-toastify';
import { Download } from 'lucide-react';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import jsPDF from 'jspdf';

const ActivityLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/activity-logs');
        setLogs(res.data);
      } catch (err) {
        toast.error('Failed to load activity logs');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const exportCSV = () => {
    const csvData = logs.map(log => ({
      Date: new Date(log.createdAt).toLocaleString(),
      User: log.user?.name || 'System',
      Action: log.action,
      Details: log.details
    }));
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'Activity_Log.csv');
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('System Activity Log', 14, 20);
    
    doc.setFontSize(10);
    let y = 30;
    logs.slice(0, 50).forEach((log, index) => { // Limit to 50 for simplicity in this example
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      doc.text(`${new Date(log.createdAt).toLocaleString()} | ${log.user?.name} | ${log.action} | ${log.details}`, 14, y);
      y += 10;
    });

    doc.save('Activity_Log.pdf');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <div className="ts-page-container" style={{ maxWidth: 960, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text)' }}>Activity Log / Export</h1>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="ts-btn ts-btn-ghost ts-btn-sm" onClick={exportCSV}>
              <Download size={16} style={{ marginRight: 6 }} /> Export CSV
            </button>
            <button className="ts-btn ts-btn-primary ts-btn-sm" onClick={exportPDF}>
              <Download size={16} style={{ marginRight: 6 }} /> Export PDF
            </button>
          </div>
        </div>

        <div className="ts-surface" style={{ overflow: 'hidden' }}>
          <div className="ts-table-wrap" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 520 }}>
            <thead>
              <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--text-subtle)' }}>Time</th>
                <th style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--text-subtle)' }}>User</th>
                <th style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--text-subtle)' }}>Action</th>
                <th style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--text-subtle)' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>No activities logged.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--text)' }}>
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--text)' }}>
                      {log.user?.name || 'Unknown'}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 600 }}>
                      {log.action}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--text)' }}>
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;
