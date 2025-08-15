import React, { useState, useEffect } from 'react';
import NotamDashboard from '../components/NotamDashboard';
import './Dashboard.css';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('main');
  const [currentDate, setCurrentDate] = useState('2025-08-11 01:18:19');
  const [currentUser, setCurrentUser] = useState('vvkpops');
  
  // Set current date and time in UTC
  useEffect(() => {
    // Update time every second
    const updateDateTime = () => {
      const now = new Date();
      const utcDateString = now.toISOString().replace('T', ' ').substring(0, 19);
      setCurrentDate(utcDateString);
    };
    
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    
    // Get current user from context or local storage
    const user = localStorage.getItem('currentUser') || 'vvkpops';
    setCurrentUser(user);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Flight Data Management</h1>
        <div className="user-info">
          <span className="date-display">
            <i className="fa fa-clock-o"></i> {currentDate}
          </span>
          <span className="user-display">
            <i className="fa fa-user"></i> {currentUser}
          </span>
        </div>
      </header>
      
      <nav className="dashboard-nav">
        <ul>
          <li className={activeTab === 'main' ? 'active' : ''}>
            <button onClick={() => setActiveTab('main')}>
              <i className="fa fa-tachometer"></i> Main Dashboard
            </button>
          </li>
          <li className={activeTab === 'notam' ? 'active' : ''}>
            <button onClick={() => setActiveTab('notam')}>
              <i className="fa fa-map-marker"></i> NOTAM Dashboard
            </button>
          </li>
          <li className={activeTab === 'flights' ? 'active' : ''}>
            <button onClick={() => setActiveTab('flights')}>
              <i className="fa fa-plane"></i> Flight Data
            </button>
          </li>
          <li className={activeTab === 'reports' ? 'active' : ''}>
            <button onClick={() => setActiveTab('reports')}>
              <i className="fa fa-bar-chart"></i> Reports
            </button>
          </li>
          <li className={activeTab === 'settings' ? 'active' : ''}>
            <button onClick={() => setActiveTab('settings')}>
              <i className="fa fa-cog"></i> Settings
            </button>
          </li>
        </ul>
      </nav>
      
      <main className="dashboard-content">
        {activeTab === 'main' && (
          <div className="main-dashboard-content">
            <h2>Flight Data Management Overview</h2>
            <div className="dashboard-widgets">
              <div className="widget">
                <h3>Active Flights</h3>
                <div className="widget-content">
                  <p className="widget-value">24</p>
                  <p className="widget-trend positive">+3 from yesterday</p>
                </div>
              </div>
              
              <div className="widget">
                <h3>Active NOTAMs</h3>
                <div className="widget-content">
                  <p className="widget-value">156</p>
                  <p className="widget-trend negative">+12 from yesterday</p>
                </div>
              </div>
              
              <div className="widget">
                <h3>Weather Alerts</h3>
                <div className="widget-content">
                  <p className="widget-value">7</p>
                  <p className="widget-trend">No change</p>
                </div>
              </div>
              
              <div className="widget">
                <h3>System Status</h3>
                <div className="widget-content">
                  <p className="widget-value status-ok">All Systems Operational</p>
                </div>
              </div>
            </div>
            
            <div className="dashboard-row">
              <div className="dashboard-col">
                <div className="widget full-width">
                  <h3>Recent Flights</h3>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Flight #</th>
                        <th>From</th>
                        <th>To</th>
                        <th>Status</th>
                        <th>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>FL291</td>
                        <td>KJFK</td>
                        <td>KLAX</td>
                        <td><span className="status active">In Air</span></td>
                        <td>08:45 UTC</td>
                      </tr>
                      <tr>
                        <td>FL182</td>
                        <td>EGLL</td>
                        <td>LFPG</td>
                        <td><span className="status completed">Completed</span></td>
                        <td>07:30 UTC</td>
                      </tr>
                      <tr>
                        <td>FL365</td>
                        <td>EDDF</td>
                        <td>LIRF</td>
                        <td><span className="status delayed">Delayed</span></td>
                        <td>09:15 UTC</td>
                      </tr>
                      <tr>
                        <td>FL127</td>
                        <td>KORD</td>
                        <td>KDFW</td>
                        <td><span className="status active">In Air</span></td>
                        <td>08:20 UTC</td>
                      </tr>
                      <tr>
                        <td>FL483</td>
                        <td>RJAA</td>
                        <td>VHHH</td>
                        <td><span className="status scheduled">Scheduled</span></td>
                        <td>10:30 UTC</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="dashboard-col">
                <div className="widget">
                  <h3>Recent NOTAMs</h3>
                  <ul className="notam-preview-list">
                    <li>
                      <span className="notam-id">A1234/23</span>
                      <span className="notam-location">KJFK</span>
                      <p>Runway 13L/31R closed for maintenance</p>
                    </li>
                    <li>
                      <span className="notam-id">B5678/23</span>
                      <span className="notam-location">EGLL</span>
                      <p>Temporary crane erected 2NM east of airport</p>
                    </li>
                    <li>
                      <span className="notam-id">C9012/23</span>
                      <span className="notam-location">EHAM</span>
                      <p>AMS VOR/DME unserviceable due to maintenance</p>
                    </li>
                  </ul>
                  <button 
                    className="view-all-button"
                    onClick={() => setActiveTab('notam')}
                  >
                    View All NOTAMs
                  </button>
                </div>
                
                <div className="widget">
                  <h3>Weather Highlights</h3>
                  <ul className="weather-preview-list">
                    <li>
                      <span className="weather-location">KJFK</span>
                      <span className="weather-condition">Thunderstorms</span>
                      <span className="weather-impact high">High Impact</span>
                    </li>
                    <li>
                      <span className="weather-location">EGLL</span>
                      <span className="weather-condition">Low Visibility</span>
                      <span className="weather-impact medium">Medium Impact</span>
                    </li>
                    <li>
                      <span className="weather-location">YSSY</span>
                      <span className="weather-condition">Strong Winds</span>
                      <span className="weather-impact medium">Medium Impact</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Quick access to NOTAM dashboard */}
            <div className="quick-access-panel">
              <h3>Quick NOTAM Access</h3>
              <p>Access the full NOTAM dashboard for comprehensive information and filtering capabilities.</p>
              <button 
                className="quick-access-button"
                onClick={() => setActiveTab('notam')}
              >
                Open NOTAM Dashboard
              </button>
            </div>
          </div>
        )}
        
        {activeTab === 'notam' && (
          <div className="notam-dashboard-wrapper">
            <NotamDashboard />
          </div>
        )}
        
        {activeTab === 'flights' && (
          <div className="flights-content">
            <h2>Flight Data</h2>
            <div className="flight-search-container">
              <div className="search-form">
                <div className="form-group">
                  <label htmlFor="flight-number">Flight Number</label>
                  <input type="text" id="flight-number" placeholder="e.g. FL291" />
                </div>
                <div className="form-group">
                  <label htmlFor="departure">Departure</label>
                  <input type="text" id="departure" placeholder="ICAO code" />
                </div>
                <div className="form-group">
                  <label htmlFor="arrival">Arrival</label>
                  <input type="text" id="arrival" placeholder="ICAO code" />
                </div>
                <div className="form-group">
                  <label htmlFor="date">Date</label>
                  <input type="date" id="date" />
                </div>
                <button className="search-flight-button">Search</button>
              </div>
            </div>
            
            <div className="flight-data-container">
              <h3>Flight Data Overview</h3>
              <div className="flight-stats">
                <div className="stat-box">
                  <span className="stat-value">243</span>
                  <span className="stat-label">Total Flights Today</span>
                </div>
                <div className="stat-box">
                  <span className="stat-value">24</span>
                  <span className="stat-label">In Air</span>
                </div>
                <div className="stat-box">
                  <span className="stat-value">18</span>
                  <span className="stat-label">Delayed</span>
                </div>
                <div className="stat-box">
                  <span className="stat-value">201</span>
                  <span className="stat-label">On Time</span>
                </div>
              </div>
              
              <div className="data-table-container">
                <table className="data-table flight-table">
                  <thead>
                    <tr>
                      <th>Flight #</th>
                      <th>Aircraft</th>
                      <th>From</th>
                      <th>To</th>
                      <th>Departure</th>
                      <th>Arrival</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>FL291</td>
                      <td>B738</td>
                      <td>KJFK</td>
                      <td>KLAX</td>
                      <td>08:45 UTC</td>
                      <td>11:30 UTC</td>
                      <td><span className="status active">In Air</span></td>
                      <td><button className="action-button">Details</button></td>
                    </tr>
                    <tr>
                      <td>FL182</td>
                      <td>A320</td>
                      <td>EGLL</td>
                      <td>LFPG</td>
                      <td>07:30 UTC</td>
                      <td>08:45 UTC</td>
                      <td><span className="status completed">Completed</span></td>
                      <td><button className="action-button">Details</button></td>
                    </tr>
                    <tr>
                      <td>FL365</td>
                      <td>A319</td>
                      <td>EDDF</td>
                      <td>LIRF</td>
                      <td>09:15 UTC</td>
                      <td>11:00 UTC</td>
                      <td><span className="status delayed">Delayed</span></td>
                      <td><button className="action-button">Details</button></td>
                    </tr>
                    <tr>
                      <td>FL127</td>
                      <td>B739</td>
                      <td>KORD</td>
                      <td>KDFW</td>
                      <td>08:20 UTC</td>
                      <td>10:10 UTC</td>
                      <td><span className="status active">In Air</span></td>
                      <td><button className="action-button">Details</button></td>
                    </tr>
                    <tr>
                      <td>FL483</td>
                      <td>B777</td>
                      <td>RJAA</td>
                      <td>VHHH</td>
                      <td>10:30 UTC</td>
                      <td>14:15 UTC</td>
                      <td><span className="status scheduled">Scheduled</span></td>
                      <td><button className="action-button">Details</button></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'reports' && (
          <div className="reports-content">
            <h2>Reports and Analytics</h2>
            
            <div className="report-controls">
              <div className="report-type-selector">
                <label htmlFor="report-type">Report Type</label>
                <select id="report-type">
                  <option value="flight-summary">Flight Summary</option>
                  <option value="notam-activity">NOTAM Activity</option>
                  <option value="weather-impact">Weather Impact</option>
                  <option value="operational">Operational Performance</option>
                </select>
              </div>
              
              <div className="date-range-selector">
                <label>Date Range</label>
                <div className="date-inputs">
                  <input type="date" placeholder="Start Date" />
                  <span>to</span>
                  <input type="date" placeholder="End Date" />
                </div>
              </div>
              
              <button className="generate-report-button">Generate Report</button>
            </div>
            
            <div className="report-preview">
              <h3>Flight Summary Report</h3>
              <p className="report-description">
                This report provides an overview of flight operations, including totals by aircraft type, 
                route analysis, and performance metrics.
              </p>
              
              <div className="report-chart">
                <div className="chart-placeholder">
                  <p>Chart visualization would appear here</p>
                  <p>Contains flight data visualization based on selected parameters</p>
                </div>
              </div>
              
              <div className="report-metrics">
                <div className="metric-card">
                  <h4>Total Flights</h4>
                  <p className="metric-value">1,243</p>
                  <p className="metric-trend positive">+5.2% from previous period</p>
                </div>
                
                <div className="metric-card">
                  <h4>On-Time Performance</h4>
                  <p className="metric-value">87.3%</p>
                  <p className="metric-trend negative">-1.8% from previous period</p>
                </div>
                
                <div className="metric-card">
                  <h4>Avg Flight Duration</h4>
                  <p className="metric-value">2h 34m</p>
                  <p className="metric-trend neutral">+2m from previous period</p>
                </div>
                
                <div className="metric-card">
                  <h4>Most Active Route</h4>
                  <p className="metric-value">KJFK-KLAX</p>
                  <p className="metric-subvalue">84 flights</p>
                </div>
              </div>
              
              <div className="report-actions">
                <button className="report-action-button">Export as PDF</button>
                <button className="report-action-button">Export as CSV</button>
                <button className="report-action-button">Schedule Report</button>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'settings' && (
          <div className="settings-content">
            <h2>Settings</h2>
            
            <div className="settings-section">
              <h3>User Preferences</h3>
              
              <div className="settings-form">
                <div className="form-group">
                  <label htmlFor="display-name">Display Name</label>
                  <input type="text" id="display-name" value={currentUser} />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input type="email" id="email" value="user@example.com" />
                </div>
                
                <div className="form-group">
                  <label htmlFor="timezone">Timezone</label>
                  <select id="timezone">
                    <option value="utc">UTC</option>
                    <option value="est">Eastern Time (ET)</option>
                    <option value="cst">Central Time (CT)</option>
                    <option value="mst">Mountain Time (MT)</option>
                    <option value="pst">Pacific Time (PT)</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="date-format">Date Format</label>
                  <select id="date-format">
                    <option value="iso">ISO (YYYY-MM-DD)</option>
                    <option value="us">US (MM/DD/YYYY)</option>
                    <option value="eu">European (DD/MM/YYYY)</option>
                  </select>
                </div>
                
                <button className="save-preferences-button">Save Preferences</button>
              </div>
            </div>
            
            <div className="settings-section">
              <h3>Application Settings</h3>
              
              <div className="settings-form">
                <div className="form-group">
                  <label htmlFor="theme">Theme</label>
                  <select id="theme">
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System Default</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="map-provider">Default Map Provider</label>
                  <select id="map-provider">
                    <option value="openstreetmap">OpenStreetMap</option>
                    <option value="google">Google Maps</option>
                    <option value="mapbox">Mapbox</option>
                  </select>
                </div>
                
                <div className="form-group checkbox-group">
                  <input type="checkbox" id="notifications" checked />
                  <label htmlFor="notifications">Enable Notifications</label>
                </div>
                
                <div className="form-group checkbox-group">
                  <input type="checkbox" id="auto-refresh" checked />
                  <label htmlFor="auto-refresh">Auto-refresh Data (every 5 minutes)</label>
                </div>
                
                <button className="save-settings-button">Save Settings</button>
              </div>
            </div>
            
            <div className="settings-section">
              <h3>Security</h3>
              
              <div className="settings-form">
                <button className="change-password-button">Change Password</button>
                <button className="enable-2fa-button">Enable Two-Factor Authentication</button>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <footer className="dashboard-footer">
        <p>&copy; 2025 Flight Data Management System | Last updated: {currentDate} UTC</p>
      </footer>
    </div>
  );
};

export default Dashboard;
