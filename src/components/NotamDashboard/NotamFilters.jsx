import React from 'react';
import './NotamFilters.css';

const NotamFilters = ({ filters, onFilterChange }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange(name, value);
  };
  
  const handleAltitudeChange = (e) => {
    const { name, value } = e.target;
    onFilterChange(name, parseInt(value, 10));
  };
  
  return (
    <div className="notam-filters">
      <h3>Filters</h3>
      
      <div className="filter-group">
        <label htmlFor="region-filter">Region:</label>
        <select 
          id="region-filter" 
          name="region"
          value={filters.region}
          onChange={handleChange}
        >
          <option value="all">All Regions</option>
          <option value="north-america">North America</option>
          <option value="europe">Europe</option>
          <option value="asia">Asia</option>
          <option value="africa">Africa</option>
          <option value="oceania">Oceania</option>
          <option value="south-america">South America</option>
        </select>
      </div>
      
      <div className="filter-group">
        <label htmlFor="type-filter">NOTAM Type:</label>
        <select 
          id="type-filter" 
          name="type"
          value={filters.type}
          onChange={handleChange}
        >
          <option value="all">All Types</option>
          <option value="obstacle">Obstacle</option>
          <option value="airspace">Airspace</option>
          <option value="procedure">Procedure</option>
          <option value="navaid">Navaid</option>
          <option value="airport">Airport</option>
        </select>
      </div>
      
      <div className="filter-group">
        <label htmlFor="date-filter">Date Range:</label>
        <select 
          id="date-filter" 
          name="dateRange"
          value={filters.dateRange}
          onChange={handleChange}
        >
          <option value="current">Current</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="custom">Custom Date Range</option>
        </select>
      </div>
      
      <div className="filter-group">
        <label htmlFor="min-altitude">Minimum Altitude (ft):</label>
        <input
          type="range"
          id="min-altitude"
          name="minAltitude"
          min="0"
          max="60000"
          step="1000"
          value={filters.minAltitude}
          onChange={handleAltitudeChange}
        />
        <span className="range-value">{filters.minAltitude} ft</span>
      </div>
      
      <div className="filter-group">
        <label htmlFor="max-altitude">Maximum Altitude (ft):</label>
        <input
          type="range"
          id="max-altitude"
          name="maxAltitude"
          min="0"
          max="60000"
          step="1000"
          value={filters.maxAltitude}
          onChange={handleAltitudeChange}
        />
        <span className="range-value">{filters.maxAltitude} ft</span>
      </div>
      
      <button 
        className="reset-filters-button"
        onClick={() => {
          onFilterChange('region', 'all');
          onFilterChange('type', 'all');
          onFilterChange('dateRange', 'current');
          onFilterChange('minAltitude', 0);
          onFilterChange('maxAltitude', 60000);
          onFilterChange('searchTerm', '');
        }}
      >
        Reset Filters
      </button>
    </div>
  );
};

export default NotamFilters;
