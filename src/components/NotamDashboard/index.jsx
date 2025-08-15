import React, { useState, useEffect, useRef } from 'react';
import './NotamDashboard.css';
import NotamMap from './NotamMap';
import NotamList from './NotamList';
import NotamDetail from './NotamDetail';
import NotamFilterPanel from './NotamFilterPanel';
import { fetchNotams, searchNotams } from '../../utils/notamUtils';

const NotamDashboard = () => {
  const [notams, setNotams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNotam, setSelectedNotam] = useState(null);
  const [filters, setFilters] = useState({
    region: 'all',
    type: 'all',
    dateRange: 'current',
    searchTerm: ''
  });
  const [searchInput, setSearchInput] = useState('');
  const [mapCenter, setMapCenter] = useState({ lat: 20, lng: 0 });
  const [mapZoom, setMapZoom] = useState(2);
  const [stats, setStats] = useState({
    total: 0,
    byType: {},
    byRegion: {},
    activeToday: 0
  });

  // Load NOTAMs when filters change
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchNotams(filters);
        setNotams(data);
        
        // Calculate statistics
        const statData = {
          total: data.length,
          byType: {},
          byRegion: {},
          activeToday: 0
        };
        
        const today = new Date();
        data.forEach(notam => {
          // Count by type
          statData.byType[notam.type] = (statData.byType[notam.type] || 0) + 1;
          
          // Count by region
          const region = notam.location.substring(0, 1);
          statData.byRegion[region] = (statData.byRegion[region] || 0) + 1;
          
          // Count active today
          const effectiveDate = new Date(notam.effectiveDate);
          if (effectiveDate <= today && (!notam.expiryDate || new Date(notam.expiryDate) >= today)) {
            statData.activeToday++;
          }
        });
        
        setStats(statData);
        setError(null);
      } catch (err) {
        console.error('Error loading NOTAMs:', err);
        setError('Failed to load NOTAM data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [filters]);
  
  // Handle filter changes
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle search
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (searchInput.trim() === filters.searchTerm) return;
    
    if (searchInput.trim().length > 2) {
      setLoading(true);
      try {
        const results = await searchNotams(searchInput);
        setNotams(results);
        setFilters(prev => ({ ...prev, searchTerm: searchInput }));
      } catch (err) {
        console.error('Error searching NOTAMs:', err);
        setError('Search failed. Please try again.');
      } finally {
        setLoading(false);
      }
    } else if (searchInput.trim().length === 0) {
      setFilters(prev => ({ ...prev, searchTerm: '' }));
    }
  };
  
  // Clear search
  const handleClearSearch = () => {
    setSearchInput('');
    if (filters.searchTerm) {
      setFilters(prev => ({ ...prev, searchTerm: '' }));
    }
  };
  
  // Select a NOTAM
  const handleSelectNotam = (notam) => {
    setSelectedNotam(notam);
    
    // Center map on selected NOTAM
    if (notam.coordinates) {
      setMapCenter(notam.coordinates);
      setMapZoom(8);
    }
  };
  
  // Close NOTAM detail view
  const handleCloseDetail = () => {
    setSelectedNotam(null);
  };
  
  // Handle map interactions
  const handleMapMove = (center, zoom) => {
    setMapCenter(center);
    setMapZoom(zoom);
  };
  
  return (
    <div className="notam-dashboard">
      <div className="notam-dashboard-header flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">NOTAM Dashboard</h2>
        
        <div className="notam-search">
          <form onSubmit={handleSearch} className="flex">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by NOTAM ID, location or keyword"
              className="bg-gray-700 p-2 rounded-l text-white"
            />
            
            {searchInput && (
              <button 
                type="button"
                onClick={handleClearSearch}
                className="bg-gray-700 px-2 text-gray-400 hover:text-white"
              >
                ×
              </button>
            )}
            
            <button 
              type="submit"
              className="bg-cyan-600 px-4 py-2 rounded-r text-white hover:bg-cyan-700"
            >
              Search
            </button>
          </form>
        </div>
      </div>
      
      <div className="notam-content flex flex-col lg:flex-row gap-4">
        <div className="notam-sidebar lg:w-72">
          <NotamFilterPanel 
            filters={filters}
            onFilterChange={handleFilterChange}
            stats={stats}
          />
        </div>
        
        <div className="notam-main flex-1">
          {error && (
            <div className="bg-red-800 text-white p-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <div className="notam-map-container h-96 bg-gray-800 rounded-lg mb-4 overflow-hidden flight-tile">
            <NotamMap 
              notams={notams}
              loading={loading}
              selectedNotam={selectedNotam}
              onSelectNotam={handleSelectNotam}
              center={mapCenter}
              zoom={mapZoom}
              onMapMove={handleMapMove}
            />
          </div>
          
          <NotamList 
            notams={notams}
            loading={loading}
            selectedNotam={selectedNotam}
            onSelectNotam={handleSelectNotam}
          />
        </div>
      </div>
      
      {selectedNotam && (
        <NotamDetail 
          notam={selectedNotam}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  );
};

export default NotamDashboard;
