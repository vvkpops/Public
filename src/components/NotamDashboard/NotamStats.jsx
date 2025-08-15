import React from 'react';
import './NotamStats.css';

const NotamStats = ({ stats }) => {
  return (
    <div className="notam-stats">
      <h3>NOTAM Statistics</h3>
      
      <div className="stats-item">
        <span className="stats-label">Total NOTAMs:</span>
        <span className="stats-value">{stats.total}</span>
      </div>
      
      <div className="stats-item">
        <span className="stats-label">Active Today:</span>
        <span className="stats-value">{stats.activeToday}</span>
      </div>
      
      <div className="stats-section">
        <h4>By Type</h4>
        {Object.entries(stats.byType).length > 0 ? (
          <ul className="stats-list">
            {Object.entries(stats.byType).map(([type, count]) => (
              <li key={type}>
                <span className={`notam-type type-${type}`}>{type}</span>
                <span className="stats-count">{count}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No data available</p>
        )}
      </div>
      
      <div className="stats-section">
        <h4>By Region</h4>
        {Object.entries(stats.byRegion).length > 0 ? (
          <ul className="stats-list">
            {Object.entries(stats.byRegion).map(([region, count]) => (
              <li key={region}>
                <span className="region-code">{region}</span>
                <span className="stats-count">{count}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No data available</p>
        )}
      </div>
    </div>
  );
};

export default NotamStats;
