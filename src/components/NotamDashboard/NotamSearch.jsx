import React, { useState } from 'react';
import './NotamSearch.css';

const NotamSearch = ({ onSearch }) => {
  const [searchInput, setSearchInput] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchInput);
  };
  
  const handleClear = () => {
    setSearchInput('');
    onSearch('');
  };
  
  return (
    <div className="notam-search">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by NOTAM ID, location, or keyword..."
          aria-label="Search NOTAMs"
        />
        
        {searchInput && (
          <button 
            type="button" 
            className="clear-search" 
            onClick={handleClear}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
        
        <button type="submit" className="search-button">
          Search
        </button>
      </form>
    </div>
  );
};

export default NotamSearch;
