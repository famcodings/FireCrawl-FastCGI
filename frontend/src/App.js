import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './index.css';

const API_BASE_URL = 'http://localhost:8000';

function App() {
  const [url, setUrl] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [requestId, setRequestId] = useState(null);
  
  const wsRef = useRef(null);

  useEffect(() => {
    // Cleanup WebSocket connection on component unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const connectWebSocket = (reqId) => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    const ws = new WebSocket(`ws://localhost:8000/ws/${reqId}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'status') {
        setStatus(data.status);
      } else if (data.type === 'result') {
        setResult(data.data);
        setStatus('completed');
        setIsLoading(false);
      } else if (data.type === 'error') {
        setError(data.message);
        setStatus('error');
        setIsLoading(false);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('WebSocket connection error');
      setIsLoading(false);
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!url || !companyName) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);
    setStatus('');

    try {
      const response = await axios.post(`${API_BASE_URL}/api/crawl`, {
        url: url,
        company_name: companyName
      });

      const { request_id } = response.data;
      setRequestId(request_id);
      setStatus('processing');
      
      // Connect to WebSocket for real-time updates
      connectWebSocket(request_id);

    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to start crawl');
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setUrl('');
    setCompanyName('');
    setIsLoading(false);
    setStatus('');
    setResult(null);
    setError('');
    setRequestId(null);
    
    if (wsRef.current) {
      wsRef.current.close();
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Firecrawl Company Analysis</h1>
        <p>Extract comprehensive company information from any website</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="url">Website URL</label>
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
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
              onChange={(e) => setCompanyName(e.target.value)}
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
                onClick={handleReset}
              >
                New Analysis
              </button>
            )}
          </div>
        </form>
      </div>

      {status && (
        <div className={`status ${status}`}>
          {status === 'processing' && (
            <>
              <span className="loading"></span> Analyzing website... This may take a few minutes.
            </>
          )}
          {status === 'completed' && 'Analysis completed successfully!'}
          {status === 'error' && 'Analysis failed'}
        </div>
      )}

      {error && (
        <div className="card">
          <h3 style={{ color: '#721c24', marginTop: 0 }}>Error</h3>
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="card">
          <h2 style={{ marginTop: 0, color: '#333' }}>Analysis Results</h2>
          <div className="result-section">
            <div className="result-item">
              <h4>Industry</h4>
              <p>{result.industry || 'Not specified'}</p>
            </div>

            <div className="result-item">
              <h4>Products & Services</h4>
              <p>{result.products_services || 'Not specified'}</p>
            </div>

            <div className="result-item">
              <h4>Mission</h4>
              <p>{result.mission || 'Not specified'}</p>
            </div>

            <div className="result-item">
              <h4>Unique Selling Proposition (USP)</h4>
              <p>{result.usp || 'Not specified'}</p>
            </div>

            <div className="result-item">
              <h4>Locations</h4>
              <p>{result.locations || 'Not specified'}</p>
            </div>

            <div className="result-item">
              <h4>Ideal Customer Profile (ICP)</h4>
              <p>{result.icp || 'Not specified'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
