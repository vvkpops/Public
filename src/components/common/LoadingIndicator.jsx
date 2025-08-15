import React from 'react';
import './LoadingIndicator.css';

const LoadingIndicator = ({ size = 'medium', text = 'Loading...' }) => {
  return (
    <div className={`loading-indicator size-${size}`}>
      <div className="spinner"></div>
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
};

export default LoadingIndicator;
