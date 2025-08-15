import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import FilterPanel from './components/FilterPanel';
import FlightTile from './components/FlightTile';
import WeatherTile from './components/WeatherTile';
import NotamDashboard from './components/NotamDashboard';
import { loadFlights } from './utils/flightUtils';

function App() {
  // Constants
  const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRrYY4e86FUw6GFaHj1I_VI2JRmKgkLepqs2uJ4myjzRUYUz3TNpOsNSJvxZELbdwN2Pe_fTdEfNyWE/pub?gid=549523756&single=true&output=csv";
  
  // State variables
  const [flights, setFlights] = useState([]);
  const [globalDashboardMinima, setGlobalDashboardMinima] = useState(
    JSON.parse(localStorage.getItem("globalDashboardMinima") || '{"ceiling":500,"vis":1}')
  );
  const [globalWeatherMinima, setGlobalWeatherMinima] = useState(
    JSON.parse(localStorage.getItem("globalWeatherMinima") || '{"ceiling":500,"vis":1}')
  );
  const [dashboardMinima, setDashboardMinima] = useState(
    JSON.parse(localStorage.getItem("dashboardMinima") || "{}")
  );
  const [weatherMinima, setWeatherMinima] = useState(
    JSON.parse(localStorage.getItem("weatherMinima") || "{}")
  );
  const [toggleAlt, setToggleAlt] = useState({});
  const [globalAlternate, setGlobalAlternate] = useState(false);
  const [currentPage, setCurrentPage] = useState('flights');
  const [weatherICAOs, setWeatherICAOs] = useState(
    JSON.parse(localStorage.getItem("weatherICAOs") || "[]")
  );
  const [lastUpdated, setLastUpdated] = useState('—');
  const [flightFilters, setFlightFilters] = useState([]);
  const [icaoFilters, setIcaoFilters] = useState([]);
  const [globalDashboardCeiling, setGlobalDashboardCeiling] = useState(globalDashboardMinima.ceiling);
  const [globalDashboardVis, setGlobalDashboardVis] = useState(globalDashboardMinima.vis);
  const [globalWeatherCeiling, setGlobalWeatherCeiling] = useState(globalWeatherMinima.ceiling);
  const [globalWeatherVis, setGlobalWeatherVis] = useState(globalWeatherMinima.vis);
  
  const weatherButtonRef = useRef(null);
  const icaoInputRef = useRef(null);

  // Computed values
  const now = new Date();
  const completedFlights = flights.filter(f => now > new Date(f.eta))
    .sort((a, b) => new Date(b.eta) - new Date(a.eta))
    .slice(0, 10);
    
  const activeFlights = flights.filter(f => {
    const start = new Date(f.std);
    const end = new Date(f.eta);
    return (start <= now && now <= end) || (start > now && (start - now) <= 12 * 3600000);
  }).sort((a, b) => {
    const startA = new Date(a.std);
    const startB = new Date(b.std);
    if (startA <= now && startB <= now) {
      return new Date(a.eta) - new Date(b.eta);
    }
    return startA - startB;
  });

  // Filter active flights
  const filteredActiveFlights = activeFlights.filter(flight => {
    const callsignMatch = !flightFilters.length || flightFilters.includes(flight.callsign.toUpperCase());
    const icaoMatch = !icaoFilters.length || 
      icaoFilters.includes(flight.depicao?.toUpperCase()) || 
      icaoFilters.includes(flight.arricao?.toUpperCase()) || 
      icaoFilters.includes(flight.alticao?.toUpperCase());
    return callsignMatch && icaoMatch;
  });

  // Effects
  useEffect(() => {
    const fetchData = async () => {
      const fetchedFlights = await loadFlights(csvUrl);
      setFlights(fetchedFlights);
      setLastUpdated(new Date().toUTCString().slice(17, 25));
      
      // Initialize toggle state for flights
      const newToggleAlt = { ...toggleAlt };
      fetchedFlights.forEach(f => {
        if (newToggleAlt[f.callsign] === undefined) {
          newToggleAlt[f.callsign] = globalAlternate;
        }
      });
      setToggleAlt(newToggleAlt);
    };
    
    fetchData();
    
    // Set up interval for periodic refreshes
    const intervalId = setInterval(fetchData, 60000);
    
    return () => clearInterval(intervalId);
  }, [csvUrl, globalAlternate]);

  useEffect(() => {
    localStorage.setItem("globalDashboardMinima", JSON.stringify(globalDashboardMinima));
  }, [globalDashboardMinima]);

  useEffect(() => {
    localStorage.setItem("globalWeatherMinima", JSON.stringify(globalWeatherMinima));
  }, [globalWeatherMinima]);

  useEffect(() => {
    localStorage.setItem("dashboardMinima", JSON.stringify(dashboardMinima));
  }, [dashboardMinima]);

  useEffect(() => {
    localStorage.setItem("weatherMinima", JSON.stringify(weatherMinima));
  }, [weatherMinima]);

  useEffect(() => {
    localStorage.setItem("weatherICAOs", JSON.stringify(weatherICAOs));
  }, [weatherICAOs]);

  // Handler functions
  const handleSetDashboardMinima = (callsign, field, value) => {
    setDashboardMinima(prev => ({
      ...prev,
      [callsign]: {
        ...(prev[callsign] || globalDashboardMinima),
        [field]: parseFloat(value)
      }
    }));
  };

  const handleResetDashboardMinima = (callsign) => {
    setDashboardMinima(prev => {
      const newMinima = { ...prev };
      delete newMinima[callsign];
      return newMinima;
    });
  };

  const handleSetWeatherMinima = (icao, field, value) => {
    setWeatherMinima(prev => ({
      ...prev,
      [icao]: {
        ...(prev[icao] || globalWeatherMinima),
        [field]: parseFloat(value)
      }
    }));
  };

  const handleResetWeatherMinima = (icao) => {
    setWeatherMinima(prev => {
      const newMinima = { ...prev };
      delete newMinima[icao];
      return newMinima;
    });
  };

  const handleApplyGlobalDashboardMinima = () => {
    const newGlobalMinima = {
      ceiling: parseFloat(globalDashboardCeiling),
      vis: parseFloat(globalDashboardVis)
    };
    setGlobalDashboardMinima(newGlobalMinima);
    setDashboardMinima({});
  };

  const handleApplyGlobalWeatherMinima = () => {
    const newGlobalMinima = {
      ceiling: parseFloat(globalWeatherCeiling),
      vis: parseFloat(globalWeatherVis)
    };
    setGlobalWeatherMinima(newGlobalMinima);
    setWeatherMinima({});
  };

  const handleSetAlternate = (callsign, value) => {
    setToggleAlt(prev => ({
      ...prev,
      [callsign]: value
    }));
  };

  const handleSetGlobal = (value) => {
    setGlobalAlternate(value);
    const newToggleAlt = {};
    flights.forEach(f => {
      newToggleAlt[f.callsign] = value;
    });
    setToggleAlt(newToggleAlt);
  };

  const handleAddWeatherICAO = () => {
    if (!icaoInputRef.current) return;
    
    const inputValue = icaoInputRef.current.value.toUpperCase();
    const icaos = inputValue
      .split(",")
      .map(s => s.trim())
      .filter(s => s.length === 4 && /^[A-Z0-9]{4}$/.test(s));

    let added = false;
    const newIcaos = [...weatherICAOs];
    
    icaos.forEach(icao => {
      if (icao && !newIcaos.includes(icao)) {
        newIcaos.push(icao);
        added = true;
      }
    });
    
    if (added) {
      setWeatherICAOs(newIcaos);
    }
    
    icaoInputRef.current.value = "";
    icaoInputRef.current.focus();
  };

  const handleAddWeatherICAOFromTile = (icao) => {
    icao = icao.trim().toUpperCase();
    if (icao && !weatherICAOs.includes(icao)) {
      setWeatherICAOs(prev => [...prev, icao]);
      
      if (weatherButtonRef.current) {
        weatherButtonRef.current.classList.add("flash-highlight");
        setTimeout(() => weatherButtonRef.current.classList.remove("flash-highlight"), 500);
      }
    }
  };

  const handleRemoveWeatherICAO = (icao) => {
    setWeatherICAOs(prev => prev.filter(i => i !== icao));
  };

  const handleAddFlightFilter = (filter) => {
    if (filter && !flightFilters.includes(filter)) {
      setFlightFilters(prev => [...prev, filter]);
    }
  };

  const handleRemoveFlightFilter = (filter) => {
    setFlightFilters(prev => prev.filter(f => f !== filter));
  };

  const handleAddIcaoFilter = (filter) => {
    if (filter && !icaoFilters.includes(filter)) {
      setIcaoFilters(prev => [...prev, filter]);
    }
  };

  const handleRemoveIcaoFilter = (filter) => {
    setIcaoFilters(prev => prev.filter(f => f !== filter));
  };

  const handleIcaoInputKeyPress = (e) => {
    if (e.key === "Enter") handleAddWeatherICAO();
  };

  return (
    <div className="App">
      <Header />
      
      <div className="flex justify-center gap-4 mb-4">
        <button 
          onClick={() => setCurrentPage('flights')} 
          id="btnFlights" 
          className={`px-4 py-2 rounded text-white ${currentPage === 'flights' ? 'bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          Flights Dashboard
        </button>
        <button 
          ref={weatherButtonRef}
          id="weatherDashboardButton" 
          onClick={() => setCurrentPage('weather')} 
          className={`px-4 py-2 rounded text-white ${currentPage === 'weather' ? 'bg-teal-700' : 'bg-teal-600 hover:bg-teal-700'}`}
        >
          Weather Monitor
        </button>
        <button 
          onClick={() => setCurrentPage('notam')} 
          className={`px-4 py-2 rounded text-white ${currentPage === 'notam' ? 'bg-cyan-700' : 'bg-cyan-600 hover:bg-cyan-700'}`}
        >
          NOTAM Dashboard
        </button>
      </div>
      
      {/* Minima controls - shorter titles */}
      {currentPage === 'flights' && (
        <div id="dashboardGlobalMinimaPanel" className="max-w-screen-2xl mx-auto px-6 mb-2">
          <div className="flex flex-wrap justify-center items-center gap-4 mb-2">
            <span className="font-bold">Flight Minima:</span>
            <label>Ceil (ft):
              <input 
                id="globalDashboardCeiling" 
                type="number" 
                className="bg-gray-700 p-1 rounded w-20 text-center"
                value={globalDashboardCeiling}
                onChange={(e) => setGlobalDashboardCeiling(e.target.value)}
              />
            </label>
            <label>Vis (SM):
              <input 
                id="globalDashboardVis" 
                type="number" 
                step="0.1" 
                className="bg-gray-700 p-1 rounded w-20 text-center"
                value={globalDashboardVis}
                onChange={(e) => setGlobalDashboardVis(e.target.value)}
              />
            </label>
            <button 
              onClick={handleApplyGlobalDashboardMinima} 
              className="bg-green-600 px-3 py-1 rounded text-white hover:bg-green-700 text-sm"
            >
              Set Default
            </button>
            <div className="inline-flex bg-gray-700 rounded-full p-1 ml-4">
              <span 
                id="globalDestSpan" 
                onClick={() => handleSetGlobal(false)} 
                className={`cursor-pointer px-2 py-1 rounded-full font-medium ${!globalAlternate ? 'bg-purple-600 text-white' : 'text-gray-300'}`}
              >
                Destination
              </span>
              <span 
                id="globalAltSpan" 
                onClick={() => handleSetGlobal(true)} 
                className={`cursor-pointer px-2 py-1 rounded-full font-medium ${globalAlternate ? 'bg-purple-600 text-white' : 'text-gray-300'}`}
              >
                Alternate
              </span>
            </div>
          </div>
        </div>
      )}
      
      {currentPage === 'weather' && (
        <div id="weatherGlobalMinimaPanel" className="max-w-screen-2xl mx-auto px-6 mb-4">
          <div className="flex flex-wrap justify-center items-center gap-4 mb-2">
            <span className="font-bold">Weather Minima:</span>
            <label>Ceil (ft):
              <input 
                id="globalWeatherCeiling" 
                type="number" 
                className="bg-gray-700 p-1 rounded w-20 text-center"
                value={globalWeatherCeiling}
                onChange={(e) => setGlobalWeatherCeiling(e.target.value)}
              />
            </label>
            <label>Vis (SM):
              <input 
                id="globalWeatherVis" 
                type="number" 
                step="0.1" 
                className="bg-gray-700 p-1 rounded w-20 text-center"
                value={globalWeatherVis}
                onChange={(e) => setGlobalWeatherVis(e.target.value)}
              />
            </label>
            <button 
              onClick={handleApplyGlobalWeatherMinima} 
              className="bg-green-600 px-3 py-1 rounded text-white hover:bg-green-700 text-sm"
            >
              Set Default
            </button>
          </div>
        </div>
      )}
      
      {/* Filter Panel */}
      {currentPage === 'flights' && (
        <FilterPanel 
          addFlightFilter={handleAddFlightFilter}
          removeFlightFilter={handleRemoveFlightFilter}
          flightFilters={flightFilters}
          addIcaoFilter={handleAddIcaoFilter}
          removeIcaoFilter={handleRemoveIcaoFilter}
          icaoFilters={icaoFilters}
        />
      )}
      
      {/* FLIGHTS PAGE */}
      {currentPage === 'flights' && (
        <div id="flightsPage" className="w-full px-6">
          <details open>
            <summary className="text-lg font-bold cursor-pointer mb-2">✅ Completed Flights (last 10)</summary>
            <div id="completedFlights" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 mt-2">
              {completedFlights.map(flight => (
                <div key={flight.callsign} className="flight-tile bg-gray-800 rounded-lg shadow p-3 border border-gray-700">
                  <div className="text-xl font-bold text-center mb-1">{flight.callsign}</div>
                  <div className="flex justify-around text-sm mb-1">
                    <div>STD: {flight.std.slice(11, 16)}Z</div>
                    <div>STA: {flight.sta.slice(11, 16)}Z</div>
                    <div>ETA: {flight.eta.slice(11, 16)}Z</div>
                  </div>
                  <div className="w-full bg-gray-700 rounded h-1 mt-1">
                    <div className="bg-green-500 h-1 rounded w-full"></div>
                  </div>
                  <div className="flex justify-between text-xs mt-1 font-bold">
                    <div>{flight.depicao} (STD)</div>
                    <div>{flight.arricao} (ETA)</div>
                  </div>
                  <div className="text-xs mt-1 font-bold">Alternate: {flight.alticao}</div>
                </div>
              ))}
            </div>
          </details>
          
          <details open>
            <summary className="text-lg font-bold cursor-pointer mb-2 mt-6">✈️ Enroute & Scheduled Flights (12hr window)</summary>
            <div id="activeFlights" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {filteredActiveFlights.map(flight => (
                <FlightTile 
                  key={flight.callsign}
                  flight={flight}
                  dashboardMinima={dashboardMinima}
                  globalDashboardMinima={globalDashboardMinima}
                  setDashboardMinima={handleSetDashboardMinima}
                  resetDashboardMinima={handleResetDashboardMinima}
                  toggleAlt={toggleAlt}
                  setAlternate={handleSetAlternate}
                  addWeatherICAOFromTile={handleAddWeatherICAOFromTile}
                />
              ))}
            </div>
          </details>
        </div>
      )}
      
      {/* WEATHER PAGE */}
      {currentPage === 'weather' && (
        <div id="weatherPage" className="w-full px-6">
          <div className="flex justify-center gap-2 mb-4">
            <input 
              id="icaoInput"
              ref={icaoInputRef}
              placeholder="Enter ICAOs (e.g. CYYT,EGLL,KJFK)" 
              className="bg-gray-700 p-2 rounded text-center w-72"
              onKeyPress={handleIcaoInputKeyPress}
            />
            <button 
              onClick={handleAddWeatherICAO} 
              className="bg-blue-600 px-3 py-1 rounded text-white hover:bg-blue-700"
            >
              Add ICAO(s)
            </button>
          </div>
          <div id="weatherTiles" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {weatherICAOs.map(icao => (
              <WeatherTile 
                key={icao}
                icao={icao}
                weatherMinima={weatherMinima}
                globalWeatherMinima={globalWeatherMinima}
                setWeatherMinima={handleSetWeatherMinima}
                resetWeatherMinima={handleResetWeatherMinima}
                removeWeatherICAO={handleRemoveWeatherICAO}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* NOTAM DASHBOARD PAGE */}
      {currentPage === 'notam' && (
        <div id="notamPage" className="w-full px-6">
          <NotamDashboard />
        </div>
      )}
      
      <Footer lastUpdated={lastUpdated} />
    </div>
  );
}

export default App;
