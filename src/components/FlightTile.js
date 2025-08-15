import React, { useState, useEffect } from 'react';
import { shortTime, calculateProgress } from '../utils/flightUtils';
import { fetchTAF, fetchMETAR, highlightTAFAtETA } from '../utils/weatherUtils';

const FlightTile = ({ 
  flight, 
  dashboardMinima, 
  globalDashboardMinima, 
  setDashboardMinima, 
  resetDashboardMinima,
  toggleAlt,
  setAlternate,
  addWeatherICAOFromTile
}) => {
  const [tafRaw, setTafRaw] = useState("");
  const [metarRaw, setMetarRaw] = useState("");
  const [tafHtml, setTafHtml] = useState("");
  const [below, setBelow] = useState(false);
  const [loading, setLoading] = useState(true);

  const useAlt = toggleAlt[flight.callsign] === true;
  const icao = useAlt ? flight.alticao : flight.arricao;
  const min = dashboardMinima[flight.callsign] || globalDashboardMinima;
  const usingDefault = !dashboardMinima[flight.callsign];

  useEffect(() => {
    const fetchData = async () => {
      if (icao) {
        setLoading(true);
        const [taf, metar] = await Promise.all([
          fetchTAF(icao), 
          fetchMETAR(icao)
        ]);
        
        setTafRaw(taf);
        setMetarRaw(metar);
        
        if (taf) {
          const result = highlightTAFAtETA(taf, min.ceiling, min.vis, flight.eta);
          setTafHtml(result.html);
          setBelow(result.below);
        }
        
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Refresh every 5 minutes
    const intervalId = setInterval(fetchData, 300000);
    
    return () => clearInterval(intervalId);
  }, [icao, flight.eta, min.ceiling, min.vis]);

  const getBorderClass = () => {
    if (loading) return "border-gray-700";
    if (tafRaw) {
      return below ? "border-red-500" : "border-green-500";
    }
    return "border-gray-700";
  };

  const getStatus = () => {
    if (!tafRaw) return "";
    
    return below 
      ? <span className="text-red-400 font-bold">🚨 Below minima</span>
      : <span className="text-green-400 font-bold">✅ Above minima</span>;
  };

  return (
    <div 
      id={`tile-${flight.callsign}`} 
      className={`flight-tile bg-gray-800 rounded-xl shadow-md p-4 hover:scale-105 transition-transform duration-300 ${getBorderClass()}`}
    >
      <div className="flight-title text-2xl font-bold text-center">{flight.callsign}</div>
      
      <div className="flex justify-between items-center text-sm mb-2">
        <span>Weather: {useAlt ? flight.alticao : flight.arricao}</span>
        <div className="inline-flex bg-gray-700 rounded-full p-1">
          <span 
            onClick={() => setAlternate(flight.callsign, false)} 
            className={`cursor-pointer px-2 py-1 rounded-full font-medium ${!useAlt ? 'bg-purple-600 text-white' : 'text-gray-300'}`}
          >
            Destination
          </span>
          <span 
            onClick={() => setAlternate(flight.callsign, true)} 
            className={`cursor-pointer px-2 py-1 rounded-full font-medium ${useAlt ? 'bg-purple-600 text-white' : 'text-gray-300'}`}
          >
            Alternate
          </span>
        </div>
      </div>
      
      <div className="text-lg flex justify-around mt-2 mb-2">
        <div>STD: {shortTime(flight.std)}</div>
        <div>STA: {shortTime(flight.sta)}</div>
        <div>ETA: {shortTime(flight.eta)}</div>
      </div>
      
      <div className="w-full bg-gray-700 rounded h-2 mt-1">
        <div 
          className="bg-green-500 h-2 rounded" 
          style={{width: `${calculateProgress(flight.std, flight.eta)}%`}}
        ></div>
      </div>
      
      <div className="flex justify-between text-sm mt-1 font-bold">
        <div>
          <span 
            className='cursor-pointer text-blue-400 hover:underline' 
            onClick={() => addWeatherICAOFromTile(flight.depicao)}
          >
            {flight.depicao}
          </span> (STD)
        </div>
        <div>
          <span 
            className='cursor-pointer text-blue-400 hover:underline' 
            onClick={() => addWeatherICAOFromTile(flight.arricao)}
          >
            {flight.arricao}
          </span> (ETA)
        </div>
      </div>
      
      <div className="flex gap-3 items-center mt-2 text-xs">
        <label className={usingDefault ? 'minima-default' : ''}>
          Ceil: 
          <input 
            type="number" 
            value={min.ceiling}
            className="bg-gray-700 p-1 rounded w-20 text-center"
            onChange={(e) => setDashboardMinima(flight.callsign, 'ceiling', e.target.value)}
          />
        </label>
        <label className={usingDefault ? 'minima-default' : ''}>
          Vis: 
          <input 
            type="number" 
            step="0.1" 
            value={min.vis}
            className="bg-gray-700 p-1 rounded w-20 text-center"
            onChange={(e) => setDashboardMinima(flight.callsign, 'vis', e.target.value)}
          />
        </label>
        {usingDefault ? 
          <span className="minima-default">(default)</span> : 
          <button 
            className="minima-reset-btn" 
            onClick={() => resetDashboardMinima(flight.callsign)}
          >
            reset
          </button>
        }
      </div>
      
      {metarRaw && (
        <div className="mt-2 text-xs">
          <strong>METAR:</strong> {metarRaw}
        </div>
      )}
      
      {tafRaw && (
        <div className="mt-2 text-xs taf-block">
          <strong>TAF:</strong>
          <div dangerouslySetInnerHTML={{ __html: tafHtml }}></div>
        </div>
      )}
      
      <div className="mt-2 text-sm">{getStatus()}</div>
    </div>
  );
};

export default FlightTile;