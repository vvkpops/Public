/**
 * NOTAM utilities for API calls and data processing
 */

// Sample data for development/demo
const SAMPLE_NOTAMS = [
  {
    id: 'A1234/23',
    location: 'KJFK',
    coordinates: { lat: 40.6413, lng: -73.7781 },
    type: 'airport',
    effectiveDate: '2025-08-10T00:00:00Z',
    expiryDate: '2025-09-10T00:00:00Z',
    description: 'Runway 13L/31R closed for maintenance. All aircraft must use alternate runways until maintenance is complete. Expected reopening September 10.'
  },
  {
    id: 'B5678/23',
    location: 'EGLL',
    coordinates: { lat: 51.4700, lng: -0.4543 },
    type: 'obstacle',
    effectiveDate: '2025-08-09T00:00:00Z',
    expiryDate: '2025-08-30T00:00:00Z',
    description: 'Temporary crane erected 2NM east of airport, height 300ft AGL. Crane will be in operation during daylight hours only. Night operations unaffected.',
    altitude: 'Surface to 300ft AGL',
    radius: '2NM from position'
  },
  {
    id: 'C9012/23',
    location: 'EHAM',
    coordinates: { lat: 52.3105, lng: 4.7683 },
    type: 'navaid',
    effectiveDate: '2025-08-11T00:00:00Z',
    expiryDate: '2025-08-18T00:00:00Z',
    description: 'AMS VOR/DME unserviceable due to maintenance. Pilots should use alternative navigation means. RNAV approach procedures unaffected.'
  },
  {
    id: 'D3456/23',
    location: 'RJTT',
    coordinates: { lat: 35.5494, lng: 139.7798 },
    type: 'airspace',
    effectiveDate: '2025-08-12T00:00:00Z',
    expiryDate: null,
    description: 'Temporary restricted area established for military exercises within 5NM radius of RJTT. All traffic must contact ATC prior to entry. Active from 0800-1600 local time daily.',
    remarks: 'Military aircraft will be operating at various altitudes. Expect radio checks on approach frequency.'
  },
  {
    id: 'E7890/23',
    location: 'YSSY',
    coordinates: { lat: -33.9500, lng: 151.1819 },
    type: 'procedure',
    effectiveDate: '2025-08-10T00:00:00Z',
    expiryDate: '2025-09-15T00:00:00Z',
    description: 'ILS approach procedure runway 16R temporarily unavailable due to equipment calibration. LPV and RNAV approaches remain available.',
    issuedBy: 'Sydney ATC'
  },
  {
    id: 'F2468/23',
    location: 'CYYZ',
    coordinates: { lat: 43.6777, lng: -79.6248 },
    type: 'airport',
    effectiveDate: '2025-08-15T00:00:00Z',
    expiryDate: '2025-08-16T00:00:00Z',
    description: 'Terminal 1 check-in counters 1-12 closed for maintenance. Passengers should proceed to counters 14-36 for check-in.'
  },
  {
    id: 'G1357/23',
    location: 'KORD',
    coordinates: { lat: 41.9742, lng: -87.9073 },
    type: 'obstacle',
    effectiveDate: '2025-08-11T00:00:00Z',
    expiryDate: '2025-10-30T00:00:00Z',
    description: 'Construction cranes up to 250ft AGL 1.5NM south of threshold runway 10L. Cranes marked and lighted.',
    altitude: 'Surface to 250ft AGL'
  },
  {
    id: 'H8642/23',
    location: 'EDDF',
    coordinates: { lat: 50.0379, lng: 8.5622 },
    type: 'navaid',
    effectiveDate: '2025-08-20T00:00:00Z',
    expiryDate: '2025-08-21T00:00:00Z',
    description: 'FRA DME temporarily out of service for maintenance 0600-1800 local time.'
  },
  {
    id: 'J4680/23',
    location: 'KLAX',
    coordinates: { lat: 33.9416, lng: -118.4085 },
    type: 'airspace',
    effectiveDate: '2025-09-01T00:00:00Z',
    expiryDate: '2025-09-05T00:00:00Z',
    description: 'Temporary flight restrictions in effect due to VIP movement. 3NM radius from KLAX below 5000ft AGL.',
    altitude: 'Surface to 5000ft AGL',
    radius: '3NM from airport reference point'
  },
  {
    id: 'K7531/23',
    location: 'LIRF',
    coordinates: { lat: 41.8003, lng: 12.2389 },
    type: 'procedure',
    effectiveDate: '2025-08-25T00:00:00Z',
    expiryDate: '2025-08-26T00:00:00Z',
    description: 'Instrument approach procedures for runway 16L/34R not available due to calibration. Visual approaches only.'
  }
];

/**
 * Fetch NOTAMs based on filter criteria
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} - Filtered NOTAM data
 */
export const fetchNotams = async (filters) => {
  // In a real implementation, this would call your API
  // For this integration, we'll use sample data
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  try {
    // Apply filters to the sample data
    let filteredData = [...SAMPLE_NOTAMS];
    
    // Filter by search term
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filteredData = filteredData.filter(notam =>
        notam.id.toLowerCase().includes(searchLower) ||
        notam.location.toLowerCase().includes(searchLower) ||
        notam.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Filter by region
    if (filters.region !== 'all') {
      const regionMapping = {
        'north-america': ['K', 'C', 'M', 'T'],
        'europe': ['E', 'L'],
        'asia': ['R', 'V', 'Z', 'O'],
        'oceania': ['Y', 'N'],
        'africa': ['F', 'D', 'H'],
        'south-america': ['S']
      };
      
      const prefixes = regionMapping[filters.region] || [];
      if (prefixes.length > 0) {
        filteredData = filteredData.filter(notam => 
          prefixes.some(prefix => notam.location.startsWith(prefix))
        );
      }
    }
    
    // Filter by type
    if (filters.type !== 'all') {
      filteredData = filteredData.filter(notam => notam.type === filters.type);
    }
    
    // Filter by date range
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      switch (filters.dateRange) {
        case 'current':
          filteredData = filteredData.filter(notam => {
            const effectiveDate = new Date(notam.effectiveDate);
            const expiryDate = notam.expiryDate ? new Date(notam.expiryDate) : null;
            return effectiveDate <= now && (!expiryDate || expiryDate >= now);
          });
          break;
          
        case 'today':
          filteredData = filteredData.filter(notam => {
            const effectiveDate = new Date(notam.effectiveDate);
            return effectiveDate >= today && effectiveDate < new Date(today.getTime() + 86400000);
          });
          break;
          
        case 'week':
          const weekAgo = new Date(now);
          weekAgo.setDate(now.getDate() - 7);
          filteredData = filteredData.filter(notam => {
            const effectiveDate = new Date(notam.effectiveDate);
            return effectiveDate >= weekAgo;
          });
          break;
          
        case 'month':
          const monthAgo = new Date(now);
          monthAgo.setMonth(now.getMonth() - 1);
          filteredData = filteredData.filter(notam => {
            const effectiveDate = new Date(notam.effectiveDate);
            return effectiveDate >= monthAgo;
          });
          break;
          
        default:
          break;
      }
    }
    
    return filteredData;
  } catch (error) {
    console.error('Error filtering NOTAMs:', error);
    throw new Error('Failed to load NOTAM data');
  }
};

/**
 * Search NOTAMs by keyword
 * @param {string} searchTerm - Search term
 * @returns {Promise<Array>} - Search results
 */
export const searchNotams = async (searchTerm) => {
  // In a real implementation, this would call your search API
  // For this integration, we'll filter the sample data
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  try {
    if (!searchTerm.trim()) {
      return SAMPLE
