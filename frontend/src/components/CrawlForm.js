/** Form component for crawl requests */
import React from 'react';

const CrawlForm = ({ 
  url, 
  companyName, 
  isLoading, 
  result, 
  error, 
  onUrlChange, 
  onCompanyNameChange, 
  onSubmit, 
  onReset 
}) => {
  return (
    <div className="card">
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
        <div className="form-group">
          <label htmlFor="url">Website URL</label>
          <input
            type="url"
            id="url"
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder="https://example.com"
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="companyName">Company Name</label>
          <input
            type="text"
            id="companyName"
            value={companyName}
            onChange={(e) => onCompanyNameChange(e.target.value)}
            placeholder="Enter company name"
            disabled={isLoading}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            type="submit" 
            className="btn" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading"></span> Processing...
              </>
            ) : (
              'Start Analysis'
            )}
          </button>
          
          {(result || error) && (
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onReset}
            >
              New Analysis
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CrawlForm;
