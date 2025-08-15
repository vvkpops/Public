import React from 'react';
import './ErrorMessage.css';

const ErrorMessage = ({ message, onDismiss }) => {
  return (
    <div className="error-message">
      <div className="error-content">
        <i className="error-icon fa fa-exclamation-triangle"></i>
        <span className="error-text">{message}</span>
      </div>
      {onDismiss && (
        <button className="dismiss-button" onClick={onDismiss}>
          ×
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
