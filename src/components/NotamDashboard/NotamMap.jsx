import React, { useEffect, useRef } from 'react';

const NotamMap = ({ 
  notams, 
  loading, 
  selectedNotam, 
  onSelectNotam,
  center,
  zoom,
  onMapMove
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  
  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;
    
    // Create map if it doesn't exist
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current, {
        center: center,
        zoom: zoom,
        minZoom: 2,
        maxZoom: 18
      });
      
      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstanceRef.current);
      
      // Add scale control
      L.control.scale({
        imperial: true,
        metric: true
      }).addTo(mapInstanceRef.current);
      
      // Handle map move events
      mapInstanceRef.current.on('moveend', () => {
        const center = mapInstanceRef.current.getCenter();
        const zoom = mapInstanceRef.current.getZoom();
        onMapMove({ lat: center.lat, lng: center.lng }, zoom);
      });
    } else {
      // Update view if center or zoom changed
      mapInstanceRef.current.setView(center, zoom, { animate: true });
    }
    
    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        // We don't actually destroy the map on unmount to prevent re-initialization issues
        // But we should clean up any layers or event listeners
      }
    };
  }, []);
  
  // Update map center and zoom if props change
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(center, zoom);
    }
  }, [center, zoom]);
  
  // Update markers when notams change
  useEffect(() => {
    if (!mapInstanceRef.current || loading) return;
    
    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapInstanceRef.current.removeLayer(marker);
    });
    markersRef.current = [];
    
    // Add markers for each NOTAM
    notams.forEach(notam => {
      if (notam.coordinates) {
        const { lat, lng } = notam.coordinates;
        
        // Create marker with custom icon based on type
        const icon = createMarkerIcon(notam.type);
        
        const marker = L.marker([lat, lng], { icon }).addTo(mapInstanceRef.current);
        
        // Add popup
        marker.bindPopup(createPopupContent(notam));
        
        // Store NOTAM reference in marker
        marker.notamId = notam.id;
        
        // Add click handler
        marker.on('click', () => {
          onSelectNotam(notam);
        });
        
        // If this is the selected NOTAM, open its popup
        if (selectedNotam && selectedNotam.id === notam.id) {
          marker.openPopup();
        }
        
        markersRef.current.push(marker);
      }
    });
    
    // Fit map to show all markers if we have any
    if (markersRef.current.length > 0 && !selectedNotam) {
      const group = L.featureGroup(markersRef.current);
      mapInstanceRef.current.fitBounds(group.getBounds(), { padding: [50, 50] });
    }
  }, [notams, loading, selectedNotam]);
  
  // Helper to create marker icon based on NOTAM type
  const createMarkerIcon = (type) => {
    // Define colors for different NOTAM types
    const colors = {
      obstacle: '#ef4444',
      airspace: '#22c55e',
      procedure: '#3b82f6',
      navaid: '#f59e0b',
      airport: '#8b5cf6',
      default: '#64748b'
    };
    
    const color = colors[type] || colors.default;
    
    return L.divIcon({
      className: `notam-marker notam-marker-${type}`,
      html: `<div style="background-color:${color}"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });
  };
  
  // Helper to create popup content
  const createPopupContent = (notam) => {
    const effectiveDate = new Date(notam.effectiveDate).toLocaleString();
    const expiryDate = notam.expiryDate 
      ? new Date(notam.expiryDate).toLocaleString()
      : 'Permanent';
    
    return `
      <div class="notam-popup">
        <h4 class="font-bold text-lg">${notam.id}</h4>
        <p><strong>Location:</strong> ${notam.location}</p>
        <p><strong>Type:</strong> <span class="notam-type type-${notam.type}">${notam.type}</span></p>
        <p><strong>Effective:</strong> ${effectiveDate}</p>
        <p><strong>Expires:</strong> ${expiryDate}</p>
        <p class="mt-2">${notam.description.substring(0, 150)}${notam.description.length > 150 ? '...' : ''}</p>
        <button class="view-details-btn mt-2">View Details</button>
      </div>
    `;
  };
  
  return (
    <div className="w-full h-full relative">
      <div 
        ref={mapRef} 
        className="w-full h-full"
      ></div>
      
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-70">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-4 border-t-cyan-500 border-r-cyan-500 border-b-gray-700 border-l-gray-700 rounded-full animate-spin"></div>
            <p className="mt-2 text-cyan-500">Loading NOTAMs...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotamMap;
