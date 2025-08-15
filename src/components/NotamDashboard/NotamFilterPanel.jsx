import React from 'react';

const NotamFilterPanel = ({ filters, onFilterChange, stats }) => {
  return (
    <div className="flight-tile bg-gray-800 rounded-lg shadow p-4">
      <h3 className="text-lg font-bold mb-4">Filters</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Region</label>
        <select
          value={filters.region}
          onChange={(e) => onFilterChange('region', e.target.value)}
          className="w-full bg-gray-700 rounded p-2 border border-gray-600"
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
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">NOTAM Type</label>
        <select
          value={filters.type}
          onChange={(e) => onFilterChange('type', e.target.value)}
          className="w-full bg-gray-700 rounded p-2 border border-gray-600"
        >
          <option value="all">All Types</option>
          <option value="obstacle">Obstacle</option>
          <option value="airspace">Airspace</option>
          <option value="procedure">Procedure</option>
          <option value="navaid">Navaid</option>
          <option value="airport">Airport</option>
        </select>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Date Range</label>
        <select
          value={filters.dateRange}
          onChange={(e) => onFilterChange('dateRange', e.target.value)}
          className="w-full bg-gray-700 rounded p-2 border border-gray-600"
        >
          <option value="current">Current</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>
      
      <button
        onClick={() => {
          onFilterChange('region', 'all');
          onFilterChange('type', 'all');
          onFilterChange('dateRange', 'current');
          onFilterChange('searchTerm', '');
        }}
        className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded mb-6"
      >
        Reset Filters
      </button>
      
      <div className="mt-6">
        <h3 className="text-lg font-bold mb-4">Statistics</h3>
        <div className="bg-gray-700 rounded p-3 mb-3">
          <div className="flex justify-between mb-2">
            <span>Total NOTAMs:</span>
            <span className="font-bold">{stats.total}</span>
          </div>
          <div className="flex justify-between">
            <span>Active Today:</span>
            <span className="font-bold">{stats.activeToday}</span>
          </div>
        </div>
        
        <div className="bg-gray-700 rounded p-3 mb-3">
          <h4 className="font-bold mb-2">By Type</h4>
          <ul>
            {Object.entries(stats.byType).map(([type, count]) => (
              <li key={type} className="flex justify-between mb-1">
                <span className={`inline-block px-2 py-1 rounded text-xs font-bold type-badge type-${type}`}>{type}</span>
                <span>{count}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="bg-gray-700 rounded p-3">
          <h4 className="font-bold mb-2">By Region</h4>
          <ul>
            {Object.entries(stats.byRegion).map(([region, count]) => (
              <li key={region} className="flex justify-between mb-1">
                <span>{region}</span>
                <span>{count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NotamFilterPanel;
