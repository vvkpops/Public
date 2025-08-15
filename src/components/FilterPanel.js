import React, { useRef, useState, useEffect } from 'react';

const FilterPanel = ({ addFlightFilter, removeFlightFilter, flightFilters, addIcaoFilter, removeIcaoFilter, icaoFilters }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ right: '6px', top: '24px', left: '' });
  const panelRef = useRef(null);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [flightFilterInput, setFlightFilterInput] = useState('');
  const [icaoFilterInput, setIcaoFilterInput] = useState('');

  const handleMouseDown = (e) => {
    setIsDragging(true);
    const rect = panelRef.current.getBoundingClientRect();
    setOffsetX(e.clientX - rect.left);
    setOffsetY(e.clientY - rect.top);
    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    let left = e.clientX - offsetX;
    let top = e.clientY - offsetY;
    
    left = Math.max(10, Math.min(window.innerWidth - panelRef.current.offsetWidth - 10, left));
    top = Math.max(10, Math.min(window.innerHeight - panelRef.current.offsetHeight - 10, top));
    
    setPosition({ left: `${left}px`, top: `${top}px`, right: 'auto' });
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      document.body.style.userSelect = '';
    }
  };

  const handleDoubleClick = () => {
    setPosition({ left: '', top: '', right: '6px' });
  };

  const handleAddFlightFilter = () => {
    if (flightFilterInput.trim()) {
      addFlightFilter(flightFilterInput.trim().toUpperCase());
      setFlightFilterInput('');
    }
  };

  const handleAddIcaoFilter = () => {
    if (icaoFilterInput.trim()) {
      addIcaoFilter(icaoFilterInput.trim().toUpperCase());
      setIcaoFilterInput('');
    }
  };

  const handleKeyPress = (e, type) => {
    if (e.key === 'Enter') {
      if (type === 'flight') handleAddFlightFilter();
      else handleAddIcaoFilter();
    }
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, offsetX, offsetY]);

  return (
    <div 
      id="flightFilterPanel" 
      ref={panelRef}
      className={`fixed z-50 ${isDragging ? 'dragging' : ''}`} 
      style={{ top: position.top, right: position.right, left: position.left }}
    >
      <div 
        className="drag-handle" 
        id="filterDragHandle"
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
      >
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" className="inline align-middle mr-1" viewBox="0 0 24 24">
          <path d="M3 6h18M6 12h12M9 18h6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Filters
      </div>

      <h3>Filters</h3>
      
      <div className="filter-section">
        <div className="flex gap-2 mb-2">
          <input 
            id="flightFilterInput" 
            type="text" 
            placeholder="Flight #" 
            value={flightFilterInput}
            onChange={(e) => setFlightFilterInput(e.target.value)}
            onKeyPress={(e) => handleKeyPress(e, 'flight')}
          />
          <button onClick={handleAddFlightFilter}>Add</button>
        </div>
        <div id="activeFlightFilters" className="flex flex-wrap gap-1 mb-1">
          {flightFilters.map(filter => (
            <div key={filter} className="filter-tag">
              {filter} <span onClick={() => removeFlightFilter(filter)}>&times;</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="filter-section">
        <div className="flex gap-2 mb-2">
          <input 
            id="icaoFilterInput" 
            type="text" 
            placeholder="ICAO (e.g. CYYT)" 
            value={icaoFilterInput}
            onChange={(e) => setIcaoFilterInput(e.target.value)}
            onKeyPress={(e) => handleKeyPress(e, 'icao')}
          />
          <button onClick={handleAddIcaoFilter}>Add</button>
        </div>
        <div id="activeIcaoFilters" className="flex flex-wrap gap-1">
          {icaoFilters.map(filter => (
            <div key={filter} className="filter-tag">
              {filter} <span onClick={() => removeIcaoFilter(filter)}>&times;</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;