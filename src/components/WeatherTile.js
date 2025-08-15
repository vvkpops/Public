import React, { useState, useEffect } from 'react';
import { fetchTAF, fetchMETAR, highlightTAFAllBelow } from '../utils/weatherUtils';

const WeatherTile = ({ 
  icao, 
  weatherMinima, 
  globalWeatherMinima, 
  setWeatherMinima, 
  resetWeatherMinima, 
  removeWeatherICAO 
}) => {
  const [tafRaw, setTafRaw] = useState("");
  const [metarRaw, setMetarRaw] = useState("");
  const [tafHtml, setTafHtml] = useState("");
  const [loading, setLoading] = useState(true);

  const min = weatherMinima[icao] || globalWeatherMinima;
  const usingDefault = !weatherMinima[icao];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [taf, metar] = await Promise.all([
        fetchTAF(icao), 
        fetchMETAR(icao)
      ]);
      
      setTafRaw(taf);
      setMetarRaw(metar);
      
      if (taf) {
        const html = highlightTAFAllBelow(taf, min.ceiling, min.vis);
        setTafHtml(html);
      }
      
      setLoading(false);
    };
    
    fetchData();
    
    // Refresh every 5 minutes
    const intervalId = setInterval(fetchData, 300000);
    
    return () => clearInterval(intervalId);
  }, [icao, min.ceiling, min.vis]);

  const getBorderClass = () => {
    if (loading) return "border-gray-700";
    if (tafHtml.includes("text-red-400")) {
      return "border-red-500";
    }
    return "border-green-500";
  };

  return (
    <div className={`flight-tile bg-gray-800 rounded-xl shadow-md p-4 ${getBorderClass()}`}>
      <button 
        onClick={() => removeWeatherICAO(icao)} 
        type="button" 
        className="weather-remove-btn" 
        title="Remove ICAO"
      >
        <svg width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 20 20">
          <path d="M5.5 14.5l9-9m-9 0l9 9" strokeLinecap="round"/>
          <rect x="3" y="3" width="14" height="14" rx="7" stroke="currentColor" strokeWidth="1.4" fill="none"/>
        </svg>
      </button>
      
      <div className="flight-title text-2xl font-bold text-center">{icao}</div>
      
      <div className="flex gap-3 items-center mt-2 text-xs">
        <label className={usingDefault ? 'minima-default' : ''}>
          Ceil: 
          <input 
            type="number" 
            value={min.ceiling}
            className="bg-gray-700 p-1 rounded w-20 text-center"
            onChange={(e) => setWeatherMinima(icao, 'ceiling', e.target.value)}
          />
        </label>
        <label className={usingDefault ? 'minima-default' : ''}>
          Vis: 
          <input 
            type="number" 
            step="0.1" 
            value={min.vis}
            className="bg-gray-700 p-1 rounded w-20 text-center"
            onChange={(e) => setWeatherMinima(icao, 'vis', e.target.value)}
          />
        </label>
        {usingDefault ? 
          <span className="minima-default">(default)</span> : 
          <button 
            className="minima-reset-btn" 
            onClick={() => resetWeatherMinima(icao)}
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
      
      {tafHtml && (
        <div className="mt-2 text-xs taf-block">
          <strong>TAF:</strong><br/>
          <div dangerouslySetInnerHTML={{ __html: tafHtml }}></div>
        </div>
      )}
    </div>
  );
};

export default WeatherTile;