import React from 'react';

const TaskFilters = ({ filters, setFilters }) => {
  
  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="row g-2 mb-3">
      {/* Search Input */}
      <div className="col-md-8">
        <div className="input-group">
          <span className="input-group-text bg-white border-end-0">
             🔍
          </span>
          <input 
            type="text" 
            name="search"
            className="form-control border-start-0 ps-0" 
            placeholder="Search tasks by title..." 
            value={filters.search}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Status Filter */}
      <div className="col-md-4">
        <select 
          name="status" 
          className="form-select" 
          value={filters.status} 
          onChange={handleChange}
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Assigned">Assigned</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
      </div>
    </div>
  );
};

export default TaskFilters;