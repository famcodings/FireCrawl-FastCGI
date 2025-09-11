/** Component for displaying crawl status */
import React from 'react';

const StatusDisplay = ({ status }) => {
  if (!status) return null;

  const getStatusMessage = () => {
    switch (status) {
      case 'processing':
        return (
          <>
            <span className="loading"></span> Analyzing website... This may take a few minutes.
          </>
        );
      case 'completed':
        return 'Analysis completed successfully!';
      case 'error':
        return 'Analysis failed';
      default:
        return `Status: ${status}`;
    }
  };

  return (
    <div className={`status ${status}`}>
      {getStatusMessage()}
    </div>
  );
};

export default StatusDisplay;
