/** Component for displaying error messages */
import React from 'react';

const ErrorDisplay = ({ error }) => {
  if (!error) return null;

  return (
    <div className="card">
      <h3 style={{ color: '#721c24', marginTop: 0 }}>Error</h3>
      <p>{error}</p>
    </div>
  );
};

export default ErrorDisplay;
