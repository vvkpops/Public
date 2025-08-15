import React, { useState, useEffect, useRef } from 'react';
import '../styles/notam.css';

const NotamDashboard = () => {
  // State variables
  const [icaoSet, setIcaoSet] = useState(() => {
    return JSON.parse(localStorage.getItem('notamIcaos') || '[]');
  });
  const [icaoSets, setIcaoSets] = useState(() => {
    return JSON.parse(localStorage.getItem('icaoSets') || '[]');
  });
  const [activeSetName, setActiveSetName] = useState('');
  const [notamDataByIcao, setNotamDataByIcao] = useState({});
  const [loadedIcaos, setLoadedIcaos] = useState(new Set());
  const [loadingIcaos, setLoadingIcaos] = useState(new Set());
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [cardScale, setCardScale] = useState(() => {
    return parseFloat(localStorage.getItem('notamCardScale') || '1');
  });
  const [filterState, setFilterState] = useState({
    rwy: true,
    twy: true,
    rsc: true,
    crfi: true,
    ils: true,
    fuel: true,
    other: true,
    cancelled: false,
    dom: false,
    current: true,
    future: true,
    keyword: ''
  });
  const [tabMode, setTabMode] = useState('ALL');
  const [icaoListCollapsed, setIcaoListCollapsed] = useState(false);
  const [editingSetName, setEditingSetName] = useState('');
  
  const icaoInputRef = useRef(null);
  const keywordInputRef = useRef(null);
  const autoRefreshTimerRef = useRef(null);
  const autoRefreshCountdownRef = useRef(300); // 5 minutes in seconds
  
  // Constants
  const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

  // Load ICAOs on mount
  useEffect(() => {
    loadInitialIcaos();
    startAutoRefresh();
    
    return () => {
      if (autoRefreshTimerRef.current) {
        clearInterval(autoRefreshTimerRef.current);
      }
    };
  }, []);
  
  // Save ICAO state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('notamIcaos', JSON.stringify(icaoSet));
  }, [icaoSet]);
  
  // Save ICAO sets to localStorage when they change
  useEffect(() => {
    localStorage.setItem('icaoSets', JSON.stringify(icaoSets));
  }, [icaoSets]);
  
  // Save card scale when it changes
  useEffect(() => {
    localStorage.setItem('notamCardScale', cardScale.toString());
    document.documentElement.style.setProperty('--card-scale', cardScale);
  }, [cardScale]);

  // Helper functions
  const loadInitialIcaos = async () => {
    // If there are ICAOs in the set, start loading them
    if (icaoSet.length > 0) {
      batchLoadIcaos(icaoSet);
    }
  };
  
  const startAutoRefresh = () => {
    if (autoRefreshTimerRef.current) {
      clearInterval(autoRefreshTimerRef.current);
    }
    
    autoRefreshCountdownRef.current = AUTO_REFRESH_INTERVAL / 1000;
    
    autoRefreshTimerRef.current = setInterval(() => {
      autoRefreshCountdownRef.current--;
      
      if (autoRefreshCountdownRef.current <= 0) {
        refreshAllNotams();
        autoRefreshCountdownRef.current = AUTO_REFRESH_INTERVAL / 1000;
      }
    }, 1000);
  };
  
  const resetAutoRefresh = () => {
    autoRefreshCountdownRef.current = AUTO_REFRESH_INTERVAL / 1000;
  };
  
  const refreshAllNotams = async () => {
    // Refresh all loaded ICAOs
    for (const icao of icaoSet) {
      fetchNotamsForIcao(icao, true);
    }
  };
  
  const batchLoadIcaos = async (icaos) => {
    // Load ICAOs in batches to avoid overwhelming the API
    const newLoadingIcaos = new Set(loadingIcaos);
    
    for (const icao of icaos) {
      if (!loadedIcaos.has(icao) && !newLoadingIcaos.has(icao)) {
        newLoadingIcaos.add(icao);
      }
    }
    
    setLoadingIcaos(newLoadingIcaos);
    
    // Process in batches of 5 with delays to be nice to the API
    const batchSize = 5;
    const delay = 2000; // 2 seconds between batches
    
    for (let i = 0; i < icaos.length; i += batchSize) {
      const batch = icaos.slice(i, i + batchSize);
      
      // Process this batch
      await Promise.all(batch.map(icao => fetchNotamsForIcao(icao, false)));
      
      // Wait before processing the next batch
      if (i + batchSize < icaos.length) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  };
  
  const fetchNotamsForIcao = async (icao, showNewNotifications = true) => {
    if (!icao) return;
    
    try {
      // Update loading state
      setLoadingIcaos(prev => new Set([...prev, icao]));
      
      const url = `https://vvkpops-notamoriginal.up.railway.app/api/notams?icao=${icao}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Check for new NOTAMs
      const prevNotams = notamDataByIcao[icao] || [];
      const prevNotamIds = new Set(prevNotams.map(n => n.id || n.number || n.qLine || n.summary));
      const newNotams = data.filter(n => !prevNotamIds.has(n.id || n.number || n.qLine || n.summary));
      
      // If there are new NOTAMs and we should show notifications
      if (showNewNotifications && newNotams.length > 0) {
        const newNotification = {
          id: Date.now(),
          message: `${icao}: ${newNotams.length} new NOTAM${newNotams.length > 1 ? 's' : ''} detected!`,
          icao,
          timestamp: new Date().toISOString(),
          read: false
        };
        
        setNotifications(prev => [newNotification, ...prev]);
      }
      
      // Update state
      setNotamDataByIcao(prev => ({
        ...prev,
        [icao]: data
      }));
      
      setLoadedIcaos(prev => new Set([...prev, icao]));
      setLoadingIcaos(prev => {
        const newSet = new Set([...prev]);
        newSet.delete(icao);
        return newSet;
      });
      
      return data;
    } catch (error) {
      console.error(`Error fetching NOTAMs for ${icao}:`, error);
      
      setLoadingIcaos(prev => {
        const newSet = new Set([...prev]);
        newSet.delete(icao);
        return newSet;
      });
      
      return null;
    }
  };
  
  const handleAddIcao = (e) => {
    e.preventDefault();
    
    if (!icaoInputRef.current) return;
    
    const inputValue = icaoInputRef.current.value.toUpperCase();
    const icaos = inputValue
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length === 4 && /^[A-Z0-9]{4}$/.test(s));
    
    if (icaos.length === 0) return;
    
    // Filter out ICAOs that are already in the set
    const newIcaos = icaos.filter(icao => !icaoSet.includes(icao));
    
    if (newIcaos.length > 0) {
      const updatedIcaoSet = [...icaoSet, ...newIcaos];
      setIcaoSet(updatedIcaoSet);
      
      // Start loading the new ICAOs
      batchLoadIcaos(newIcaos);
    }
    
    // Clear the input
    icaoInputRef.current.value = '';
    icaoInputRef.current.focus();
  };
  
  const handleRemoveIcao = (icao) => {
    setIcaoSet(prev => prev.filter(i => i !== icao));
  };
  
  const handleFilterChange = (key, value) => {
    setFilterState(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const handleKeywordChange = (e) => {
    setFilterState(prev => ({
      ...prev,
      keyword: e.target.value
    }));
  };
  
  const handleScaleChange = (e) => {
    setCardScale(parseFloat(e.target.value));
  };
  
  const handleTabClick = (mode) => {
    setTabMode(mode);
  };
  
  const handleToggleNotifications = () => {
    setShowNotifications(prev => !prev);
  };
  
  const handleClearNotifications = () => {
    setNotifications([]);
  };
  
  const handleMarkNotificationRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };
  
  const handleSaveSet = () => {
    if (!editingSetName.trim()) return;
    
    const newSet = {
      name: editingSetName.trim(),
      icaos: [...icaoSet]
    };
    
    setIcaoSets(prev => [...prev, newSet]);
    setEditingSetName('');
    setActiveSetName(newSet.name);
  };
  
  const handleLoadSet = (setName) => {
    const set = icaoSets.find(s => s.name === setName);
    if (!set) return;
    
    setIcaoSet(set.icaos);
    setActiveSetName(setName);
    
    // Load any new ICAOs
    const newIcaos = set.icaos.filter(icao => !loadedIcaos.has(icao));
    if (newIcaos.length > 0) {
      batchLoadIcaos(newIcaos);
    }
  };
  
  const handleDeleteSet = (setName) => {
    setIcaoSets(prev => prev.filter(s => s.name !== setName));
    if (activeSetName === setName) {
      setActiveSetName('');
    }
  };
  
  // Filter NOTAMs based on current filters
  const filterNotams = (notams) => {
    if (!notams || !Array.isArray(notams)) return [];
    
    return notams.filter(notam => {
      if (!notam) return false;
      
      // Get the summary and body text
      const summary = (notam.summary || '').toUpperCase();
      const body = (notam.body || '').toUpperCase();
      const text = summary + ' ' + body;
      
      // Apply filters
      const isRunwayClosure = /\b(RWY|RUNWAY)[^\n]*\b(CLSD|CLOSED)\b/.test(text);
      const isTaxiwayClosure = /\b(TWY|TAXIWAY)[^\n]*\b(CLSD|CLOSED)\b/.test(text);
      const isRSC = /\bRSC\b/.test(text);
      const isCRFI = /\bCRFI\b/.test(text);
      const isILS = /\bILS\b/.test(text) && !/\bCLOSED|CLSD\b/.test(text);
      const isFuel = /\bFUEL\b/.test(text);
      const isCancelled = notam.type === "C" || /\b(CANCELLED|CNL)\b/.test(text);
      const isDomestic = /\bDOM\b/.test(text) || /^D/.test(notam.number || '');
      
      // Match keyword filter
      const keywordMatch = !filterState.keyword || 
                           text.includes(filterState.keyword.toUpperCase());
      
      // Date filters
      const now = new Date();
      const validFrom = notam.validFrom ? new Date(notam.validFrom) : null;
      const validTo = notam.validTo ? new Date(notam.validTo) : null;
      
      const isCurrent = validFrom && validFrom <= now && (!validTo || validTo >= now);
      const isFuture = validFrom && validFrom > now;
      
      // Apply all filters
      if (isRunwayClosure && !filterState.rwy) return false;
      if (isTaxiwayClosure && !filterState.twy) return false;
      if (isRSC && !filterState.rsc) return false;
      if (isCRFI && !filterState.crfi) return false;
      if (isILS && !filterState.ils) return false;
      if (isFuel && !filterState.fuel) return false;
      if (isCancelled && !filterState.cancelled) return false;
      if (isDomestic && !filterState.dom) return false;
      
      if (isCurrent && !filterState.current) return false;
      if (isFuture && !filterState.future) return false;
      
      if (!keywordMatch) return false;
      
      // If it's not a specific type and other is not checked
      if (!isRunwayClosure && !isTaxiwayClosure && !isRSC && !isCRFI && 
          !isILS && !isFuel && !isCancelled && !filterState.other) {
        return false;
      }
      
      return true;
    });
  };
  
  // Get all NOTAMs for display
  const getAllNotams = () => {
    if (tabMode === 'ALL') {
      // Get all NOTAMs for all ICAOs
      let allNotams = [];
      for (const icao of icaoSet) {
        if (notamDataByIcao[icao]) {
          allNotams = allNotams.concat(notamDataByIcao[icao].map(n => ({ ...n, icao })));
        }
      }
      return filterNotams(allNotams);
    } else {
      // Get NOTAMs for specific ICAO
      return filterNotams(notamDataByIcao[tabMode] || []);
    }
  };
  
  // Format a NOTAM for display
  const formatNotamCard = (notam) => {
    if (!notam) return null;
    
    // Get the classification title
    const classification = (notam.classification || '').trim().toUpperCase();
    const classificationTitle = 
      classification === 'AA' ? 'Aerodrome' :
      classification === 'RW' ? 'Runway' :
      classification === 'TW' ? 'Taxiway' :
      classification === 'AB' ? 'Obstacle' :
      classification === 'AC' ? 'Communications' :
      classification === 'AD' ? 'Navigation Aid' :
      classification === 'AE' ? 'Airspace Restriction' :
      classification === 'FDC' ? 'Flight Data Center' :
      'Other';
    
    // Get flags for styling
    const flags = {
      isRunwayClosure: /\b(RWY|RUNWAY)[^\n]*\b(CLSD|CLOSED)\b/i.test(notam.summary + ' ' + notam.body),
      isTaxiwayClosure: /\b(TWY|TAXIWAY)[^\n]*\b(CLSD|CLOSED)\b/i.test(notam.summary + ' ' + notam.body),
      isRSC: /\bRSC\b/i.test(notam.summary + ' ' + notam.body),
      isCRFI: /\bCRFI\b/i.test(notam.summary + ' ' + notam.body),
      isILS: /\bILS\b/i.test(notam.summary + ' ' + notam.body) && !/\bCLOSED|CLSD\b/i.test(notam.summary + ' ' + notam.body),
      isFuel: /\bFUEL\b/i.test(notam.summary + ' ' + notam.body),
      isCancelled: notam.type === "C" || /\b(CANCELLED|CNL)\b/i.test(notam.summary + ' ' + notam.body),
    };
    
    // Determine header class
    let headClass = 'head-other';
    if (flags.isRunwayClosure) headClass = 'head-rwy';
    else if (flags.isTaxiwayClosure) headClass = 'head-twy';
    else if (flags.isRSC) headClass = 'head-rsc';
    else if (flags.isCRFI) headClass = 'head-crfi';
    else if (flags.isILS) headClass = 'head-ils';
    else if (flags.isFuel) headClass = 'head-fuel';
    else if (flags.isCancelled) headClass = 'head-cancelled';
    
    // Determine header title
    let headTitle = 'NOTAM';
    if (flags.isRunwayClosure) headTitle = 'RUNWAY CLOSURE';
    else if (flags.isTaxiwayClosure) headTitle = 'TAXIWAY CLOSURE';
    else if (flags.isRSC) headTitle = 'RSC';
    else if (flags.isCRFI) headTitle = 'CRFI';
    else if (flags.isILS) headTitle = 'ILS';
    else if (flags.isFuel) headTitle = 'FUEL';
    else if (flags.isCancelled) headTitle = 'CANCELLED';
    
    // Extract runways if mentioned
    const runways = extractRunways(notam.summary + ' ' + notam.body);
    
    // Format dates
    const validFrom = notam.validFrom ? new Date(notam.validFrom) : null;
    const validTo = notam.validTo ? new Date(notam.validTo) : null;
    
    const formatDate = (date) => {
      if (!date) return 'PERM';
      return date.toISOString().replace('T', ' ').substring(0, 16) + 'Z';
    };
    
    // Check if content needs expansion
    const needsExpansion = (notam.summary || '').length > 100 || (notam.body || '').length > 200;
    
    return (
      <div key={notam.id || notam.number || notam.qLine || Math.random().toString(36).substring(2, 11)} 
           className={`notam-card ${headClass}`}>
        <div className="notam-card-head">
          <div className="notam-card-title">{headTitle}</div>
          <div className="notam-card-location">{notam.icao || notam.location}</div>
        </div>
        <div className="notam-card-body">
          <div className="notam-card-info">
            <div><strong>Number:</strong> {notam.number || 'N/A'}</div>
            <div><strong>Type:</strong> {classificationTitle}</div>
            {runways && <div><strong>RWY:</strong> {runways}</div>}
            <div className="notam-card-dates">
              <div><strong>From:</strong> {formatDate(validFrom)}</div>
              <div><strong>To:</strong> {formatDate(validTo)}</div>
            </div>
          </div>
          <div className="notam-card-summary">{notam.summary}</div>
          {needsExpansion ? (
            <div className="notam-card-expand">
              <button className="notam-card-expand-btn">Show Full Text</button>
            </div>
          ) : null}
          <div className="notam-card-text">{notam.body}</div>
          <div className="notam-card-actions">
            <button className="notam-raw-link">View Raw NOTAM</button>
          </div>
        </div>
      </div>
    );
  };
  
  // Extract runways from text
  const extractRunways = (text) => {
    if (!text) return '';
    
    const rwyMatches = [];
    const regex = /\bRWY\s*(\d{2,3}(?:[LRC])?(?:\/\d{2,3}(?:[LRC])?)*)/gi;
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      rwyMatches.push(match[1]);
    }
    
    return [...new Set(rwyMatches)].join(', ');
  };
  
  // Render progress bar
  const renderProgressBar = () => {
    const total = icaoSet.length;
    const loaded = loadedIcaos.size;
    const percent = total > 0 ? (loaded / total) * 100 : 0;
    
    const minutes = Math.floor(autoRefreshCountdownRef.current / 60);
    const seconds = autoRefreshCountdownRef.current % 60;
    
    return (
      <div id="icao-progress-bar-outer" className="my-4">
        <div id="icao-progress-label">ICAO Load Progress</div>
        <div id="icao-progress-bar-bg" className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
          <div id="icao-progress-bar" className="bg-blue-500 h-full rounded-full" style={{ width: `${percent}%` }}></div>
          <div id="icao-progress-text" className="absolute inset-0 flex items-center justify-center text-xs font-bold">
            {loaded} / {total} loaded
          </div>
        </div>
        <div id="icao-progress-timer" className="text-right text-xs text-cyan-300">
          Auto refresh in {minutes}:{seconds.toString().padStart(2, '0')}
        </div>
      </div>
    );
  };
  
  // Render ICAO list
  const renderIcaoList = () => {
    return (
      <div id="icao-list" className="flex flex-wrap gap-2 mt-1">
        {icaoSet.map(icao => (
          <div key={icao} className="icao-tag">
            {icao}
            <span className="icao-remove" onClick={() => handleRemoveIcao(icao)}>&times;</span>
          </div>
        ))}
      </div>
    );
  };
  
  // Render ICAO sets bar
  const renderIcaoSetsBar = () => {
    return (
      <div id="icao-sets-bar" className="flex flex-wrap items-center gap-2 mb-2">
        <button className="icao-set-new-btn" onClick={() => setEditingSetName('New Set')}>
          <i className="fas fa-plus"></i> New Set
        </button>
        
        {icaoSets.map(set => (
          <div key={set.name} className={`icao-set-item ${activeSetName === set.name ? 'active' : ''}`}>
            <button className="icao-set-load" onClick={() => handleLoadSet(set.name)}>
              {set.name} ({set.icaos.length})
            </button>
            <button className="icao-set-delete" onClick={(e) => { e.stopPropagation(); handleDeleteSet(set.name); }}>
              &times;
            </button>
          </div>
        ))}
        
        {editingSetName && (
          <div className="icao-set-editor">
            <input 
              type="text" 
              value={editingSetName}
              onChange={(e) => setEditingSetName(e.target.value)}
              placeholder="Set name"
              className="icao-set-name-input"
            />
            <button className="icao-set-save" onClick={handleSaveSet}>Save</button>
          </div>
        )}
      </div>
    );
  };
  
  // Render ICAO tabs
  const renderTabs = () => {
    return (
      <div id="icao-tabs" className="flex flex-wrap mb-4 border-b border-gray-700">
        <div 
          className={`px-4 py-2 cursor-pointer ${tabMode === 'ALL' ? 'bg-blue-800 text-white' : 'hover:bg-gray-700'}`}
          onClick={() => handleTabClick('ALL')}
        >
          ALL
        </div>
        
        {icaoSet.map(icao => (
          <div 
            key={icao}
            className={`px-4 py-2 cursor-pointer ${tabMode === icao ? 'bg-blue-800 text-white' : 'hover:bg-gray-700'}`}
            onClick={() => handleTabClick(icao)}
          >
            {icao}
          </div>
        ))}
      </div>
    );
  };
  
  // Get the filtered NOTAMs
  const filteredNotams = getAllNotams();
  
  return (
    <div className="notam-dashboard">
      {/* Notification Bell */}
      <div id="notification-bell" className="notification-bell" onClick={handleToggleNotifications}>
        <span style={{ fontSize: '26px', position: 'relative' }}>
          <i className="fas fa-bell"></i>
          <span id="notification-badge" className="notification-badge">
            {notifications.filter(n => !n.read).length}
          </span>
        </span>
      </div>
      
      {/* Notification Modal */}
      {showNotifications && (
        <div id="notification-modal" className="notification-modal">
          <div className="notification-modal-header">
            <span style={{ fontSize: '1.2em', fontWeight: 'bold' }}>Notifications</span>
            <button id="clear-notifications-btn" className="clear-notifications-btn" onClick={handleClearNotifications}>
              Clear All
            </button>
          </div>
          <div id="notification-list" className="notification-list">
            {notifications.length === 0 ? (
              <div className="notification-empty">No notifications</div>
            ) : (
              notifications.map(notif => (
                <div 
                  key={notif.id}
                  className={`notification-item ${notif.read ? 'read' : ''}`}
                  onClick={() => {
                    handleMarkNotificationRead(notif.id);
                    handleTabClick(notif.icao);
                    setShowNotifications(false);
                  }}
                >
                  <div className="notification-message">{notif.message}</div>
                  <div className="notification-time">
                    {new Date(notif.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      
      <div className="container mx-auto px-2 py-6">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6 text-cyan-300 flex items-center gap-3">
          <i className="fas fa-plane-departure text-xl text-cyan-400"></i>
          NOTAM Dashboard
        </h1>
        
        {/* ICAO input area */}
        <div className="glass p-4 flex flex-col sm:flex-row items-center gap-4 mb-4">
          <form id="icao-form" className="flex flex-wrap items-center gap-3 w-full" onSubmit={handleAddIcao}>
            <input 
              id="icao-input"
              ref={icaoInputRef}
              className="px-4 py-2 rounded-lg bg-[#21263b] border border-[#283057] text-lg outline-cyan-300 font-mono tracking-widest w-56 uppercase"
              maxLength={60}
              placeholder="ICAO (comma separated)"
              spellCheck="false"
            />
            <button 
              type="submit"
              className="bg-cyan-500 hover:bg-cyan-400 px-4 py-2 rounded-lg font-bold text-[#131926] transition shadow"
            >
              Add
            </button>
            <button 
              id="icao-list-toggle"
              type="button"
              className="ml-auto px-3 py-1 rounded-full bg-[#18213b] text-cyan-300 hover:bg-[#273b5c]"
              onClick={() => setIcaoListCollapsed(prev => !prev)}
            >
              {icaoListCollapsed ? '⯈' : '⯆'}
            </button>
          </form>
          {!icaoListCollapsed && (
            <div id="icao-list-wrapper" className="w-full sm:w-auto">
              {renderIcaoList()}
            </div>
          )}
        </div>
        
        {/* ICAO Sets Bar */}
        {renderIcaoSetsBar()}
        
        {/* Progress Bar */}
        {renderProgressBar()}
        
        {/* Filter bar */}
        <div className="glass px-3 py-2 mb-4 flex flex-wrap gap-4 items-center justify-between">
          <div className="filter-chips flex flex-wrap items-center gap-2">
            <input 
              type="checkbox" 
              id="f-rwy" 
              className="filter-chip-input" 
              checked={filterState.rwy}
              onChange={(e) => handleFilterChange('rwy', e.target.checked)}
            />
            <label htmlFor="f-rwy" className="filter-chip filter-chip-rwy">
              <span className="filter-chip-label">RWY Closure</span>
            </label>
            
            <input 
              type="checkbox" 
              id="f-twy" 
              className="filter-chip-input" 
              checked={filterState.twy}
              onChange={(e) => handleFilterChange('twy', e.target.checked)}
            />
            <label htmlFor="f-twy" className="filter-chip filter-chip-twy">
              <span className="filter-chip-label">TWY Closure</span>
            </label>
            
            <input 
              type="checkbox" 
              id="f-rsc" 
              className="filter-chip-input" 
              checked={filterState.rsc}
              onChange={(e) => handleFilterChange('rsc', e.target.checked)}
            />
            <label htmlFor="f-rsc" className="filter-chip filter-chip-rsc">
              <span className="filter-chip-label">RSC</span>
            </label>
            
            <input 
              type="checkbox" 
              id="f-crfi" 
              className="filter-chip-input" 
              checked={filterState.crfi}
              onChange={(e) => handleFilterChange('crfi', e.target.checked)}
            />
            <label htmlFor="f-crfi" className="filter-chip filter-chip-crfi">
              <span className="filter-chip-label">CRFI</span>
            </label>
            
            <input 
              type="checkbox" 
              id="f-ils" 
              className="filter-chip-input" 
              checked={filterState.ils}
              onChange={(e) => handleFilterChange('ils', e.target.checked)}
            />
            <label htmlFor="f-ils" className="filter-chip filter-chip-ils">
              <span className="filter-chip-label">ILS</span>
            </label>
            
            <input 
              type="checkbox" 
              id="f-fuel" 
              className="filter-chip-input" 
              checked={filterState.fuel}
              onChange={(e) => handleFilterChange('fuel', e.target.checked)}
            />
            <label htmlFor="f-fuel" className="filter-chip filter-chip-fuel">
              <span className="filter-chip-label">FUEL</span>
            </label>
            
            <input 
              type="checkbox" 
              id="f-other" 
              className="filter-chip-input" 
              checked={filterState.other}
              onChange={(e) => handleFilterChange('other', e.target.checked)}
            />
            <label htmlFor="f-other" className="filter-chip filter-chip-other">
              <span className="filter-chip-label">Other</span>
            </label>
            
            <input 
              type="checkbox" 
              id="f-cancelled" 
              className="filter-chip-input" 
              checked={filterState.cancelled}
              onChange={(e) => handleFilterChange('cancelled', e.target.checked)}
            />
            <label htmlFor="f-cancelled" className="filter-chip filter-chip-cancelled">
              <span className="filter-chip-label">Cancelled</span>
            </label>
            
            <input 
              type="checkbox" 
              id="f-dom" 
              className="filter-chip-input" 
              checked={filterState.dom}
              onChange={(e) => handleFilterChange('dom', e.target.checked)}
            />
            <label htmlFor="f-dom" className="filter-chip filter-chip-dom">
              <span className="filter-chip-label">DOM</span>
            </label>
            
            <input 
              type="checkbox" 
              id="f-current" 
              className="filter-chip-input" 
              checked={filterState.current}
              onChange={(e) => handleFilterChange('current', e.target.checked)}
            />
            <label htmlFor="f-current" className="filter-chip filter-chip-current">
              <span className="filter-chip-label">Current</span>
            </label>
            
            <input 
              type="checkbox" 
              id="f-future" 
              className="filter-chip-input" 
              checked={filterState.future}
              onChange={(e) => handleFilterChange('future', e.target.checked)}
            />
            <label htmlFor="f-future" className="filter-chip filter-chip-future">
              <span className="filter-chip-label">Future</span>
            </label>
          </div>
          
          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            <div className="card-scale-wrap">
              <span style={{ color: '#0ff', fontWeight: 'bold' }}>Card Size</span>
              <input 
                id="card-scale-slider" 
                className="card-scale-slider" 
                type="range" 
                min="0.5" 
                max="1.5" 
                step="0.01" 
                value={cardScale}
                onChange={handleScaleChange}
              />
              <span className="card-scale-value" id="card-scale-value">{cardScale.toFixed(2)}x</span>
            </div>
            
            <input 
              id="f-keyword" 
              ref={keywordInputRef}
              type="text" 
              className="px-3 py-1 rounded-lg bg-[#21263b] border border-[#283057] text-base font-mono w-36"
              placeholder="Keyword"
              value={filterState.keyword}
              onChange={handleKeywordChange}
            />
            
            <button 
              type="button" 
              id="reload-all" 
              className="ml-3 px-3 py-1 rounded-lg bg-[#2a3352] text-cyan-300 hover:bg-cyan-950 shadow"
              onClick={refreshAllNotams}
            >
              <i className="fas fa-arrows-rotate"></i> Reload
            </button>
          </div>
        </div>
        
        {/* ICAO tabs */}
        {renderTabs()}
        
        {/* Main NOTAM card grid */}
        <div id="result" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotams.map(notam => formatNotamCard(notam))}
        </div>
        
        {filteredNotams.length === 0 && (
          <div className="text-center p-8 text-gray-400">
            No NOTAMs matching the current filters
          </div>
        )}
      </div>
      
      <button 
        id="back-to-top-btn" 
        title="Back to top" 
        aria-label="Back to top"
        className="fixed bottom-6 right-6 p-3 rounded-full bg-blue-700 text-white shadow-lg"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <i className="fas fa-arrow-up"></i>
      </button>
    </div>
  );
};

export default NotamDashboard;
