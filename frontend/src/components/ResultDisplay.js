/** Component for displaying analysis results */
import React from 'react';

const ResultDisplay = ({ result }) => {
  if (!result) return null;

  const resultItems = [
    { key: 'industry', label: 'Industry' },
    { key: 'products_services', label: 'Products & Services' },
    { key: 'mission', label: 'Mission' },
    { key: 'usp', label: 'Unique Selling Proposition (USP)' },
    { key: 'locations', label: 'Locations' },
    { key: 'icp', label: 'Ideal Customer Profile (ICP)' }
  ];

  return (
    <div className="card">
      <h2 style={{ marginTop: 0, color: '#333' }}>Analysis Results</h2>
      <div className="result-section">
        {resultItems.map(({ key, label }) => (
          <div key={key} className="result-item">
            <h4>{label}</h4>
            <p>{result[key] || 'Not specified'}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResultDisplay;
