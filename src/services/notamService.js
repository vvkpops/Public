/**
 * Service for fetching and processing NOTAM data
 * Migrated from NotamOriginal project
 */

// API base URL - this should match your actual API endpoint
const API_BASE_URL = 'https://api.notam-service.com/v1';

/**
 * Fetch NOTAM data based on filter criteria
 * @param {Object} filters - Filter criteria
 * @param {string} token - Authentication token
 * @returns {Promise<Array>} - Array of NOTAM objects
 */
export const fetchNotamData = async (filters, token) => {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();
    
    if (filters.region !== 'all') {
      queryParams.append('region', filters.region);
    }
    
    if (filters.type !== 'all') {
      queryParams.append('type', filters.type);
    }
    
    if (filters.dateRange !== 'all') {
      queryParams.append('dateRange', filters.dateRange);
    }
    
    if (filters.minAltitude > 0) {
      queryParams.append('minAltitude', filters.minAltitude);
    }
    
    if (filters.maxAltitude < 60000) {
      queryParams.append('maxAltitude', filters.maxAltitude);
    }
    
    // Make the API request
    const response = await fetch(`${API_BASE_URL}/notams?${queryParams.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw { 
        status: response.status, 
        message: `API error: ${response.status} ${response.statusText}` 
      };
    }
    
    const data = await response.json();
    return data.notams || [];
  } catch (error) {
    console.error('Error fetching NOTAM data:', error);
    
    // For demo purposes, return sample data if API fails
    // In production, this should be removed
    if (process.env.NODE_ENV === 'development') {
      return SAMPLE_NOTAMS;
    }
    
    throw error;
  }
};

/**
 * Search NOTAMs by keyword or identifier
 * @param {string} searchTerm - The search term
 * @param {string} token - Authentication token
 * @returns {Promise<Array>} - Array of matching NOTAM objects
 */
export const searchNotams = async (searchTerm, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/notams/search?q=${encodeURIComponent(searchTerm)}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw { 
        status: response.status, 
        message: `API error: ${response.status} ${response.statusText}` 
      };
    }
    
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error searching NOTAMs:', error);
    
    // For demo purposes, return filtered sample data if API fails
    // In production, this should be removed
    if (process.env.NODE_ENV === 'development') {
      return SAMPLE_NOTAMS.filter(notam => 
        notam.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notam.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notam.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    throw error;
  }
};

/**
 * Fetch detailed information for a specific NOTAM
 * @param {string} notamId - The ID of the NOTAM to fetch
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} - NOTAM details
 */
export const fetchDetailedNotam = async (notamId, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/notams/${encodeURIComponent(notamId)}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw { 
        status: response.status, 
        message: `API error: ${response.status} ${response.statusText}` 
      };
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching NOTAM details for ${notamId}:`, error);
    
    // For demo purposes, return sample detailed data if API fails
    // In production, this should be removed
    if (process.env.NODE_ENV === 'development') {
      const notam = SAMPLE_NOTAMS.find(n => n.id === notamId);
      
      if (!notam) {
        throw new Error(`NOTAM with ID ${notamId} not found`);
      }
      
      return {
        ...notam,
        // Add additional details that might be fetched only when viewing a specific NOTAM
        issuedBy: 'FAA',
        validUntil: '2025-09-10',
        altitude: 'Surface to 5000ft',
        radius: '5NM',
        remarks: 'Exercise extreme caution in the vicinity',
        geometry: {
          type: 'circle',
          center: notam.coordinates,
          radius: 5 // nautical miles
        }
      };
    }
    
    throw error;
  }
};

// Sample NOTAM data for development fallback
const SAMPLE_NOTAMS = [
  {
    id: 'A1234/23',
    location: 'KJFK',
    coordinates: { lat: 40.6413, lng: -73.7781 },
    type: 'airport',
    effectiveDate: '2025-08-10T00:00:00Z',
    expiryDate: '2025-09-10T00:00:00Z',
    description: 'Runway 13L/31R closed for maintenance'
  },
  {
    id: 'B5678/23',
    location: 'EGLL',
    coordinates: { lat: 51.4700, lng: -0.4543 },
    type: 'obstacle',
    effectiveDate: '2025-08-09T00:00:00Z',
    expiryDate: '2025-08-30T00:00:00Z',
    description: 'Temporary crane erected 2NM east of airport, height 300ft AGL'
  },
  {
    id: 'C9012/23',
    location: 'EHAM',
    coordinates: { lat: 52.3105, lng: 4.7683 },
    type: 'navaid',
    effectiveDate: '2025-08-11T00:00:00Z',
    expiryDate: '2025-08-18T00:00:00Z',
    description: 'AMS VOR/DME unserviceable due to maintenance'
  },
  {
    id: 'D3456/23',
    location: 'RJTT',
    coordinates: { lat: 35.5494, lng: 139.7798 },
    type: 'airspace',
    effectiveDate: '2025-08-12T00:00:00Z',
    expiryDate: null,
    description: 'Temporary restricted area established for military exercises'
  },
  {
    id: 'E7890/23',
    location: 'YSSY',
    coordinates: { lat: -33.9500, lng: 151.1819 },
    type: 'procedure',
    effectiveDate: '2025-08-10T00:00:00Z',
    expiryDate: '2025-09-15T00:00:00Z',
    description: 'ILS approach procedure runway 16R temporarily unavailable'
  }
];
