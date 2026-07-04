import React, { useState } from 'react';

const TaskFilters = ({ filters, setFilters }) => {
  const statuses = ['All', 'Pending', 'Assigned', 'In Progress', 'Completed'];

  return (
    <div className="ts-task-filters-row" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
      {/* Status Pills */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {statuses.map(s => (
          <button
            key={s}
            className={`ts-tab ${filters.status === s ? 'active' : ''}`}
            onClick={() => setFilters({ ...filters, status: s })}
            style={{ borderRadius: 0, paddingBottom: 4 }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="ts-search" style={{ marginLeft: 'auto', minWidth: 120, maxWidth: 220 }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             strokeWidth="2.5" style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          placeholder="Search tasks..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
      </div>
    </div>
  );
};

export default TaskFilters;