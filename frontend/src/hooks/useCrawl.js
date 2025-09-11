/** Custom hooks for application state management */
import { useState, useEffect, useRef } from 'react';
import { apiService } from '../services/apiService';
import { webSocketService } from '../services/webSocketService';

/**
 * Hook for managing crawl operations
 * @returns {Object} Crawl state and methods
 */
export const useCrawl = () => {
  const [url, setUrl] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [requestId, setRequestId] = useState(null);

  const wsRef = useRef(null);

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect();
      }
    };
  }, []);

  const startCrawl = async () => {
    if (!url || !companyName) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);
    setStatus('');

    try {
      const response = await apiService.startCrawl(url, companyName);
      const { request_id } = response;
      
      setRequestId(request_id);
      setStatus('processing');
      
      // Connect to WebSocket for real-time updates
      connectWebSocket(request_id);

    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const connectWebSocket = (reqId) => {
    if (wsRef.current) {
      wsRef.current.disconnect();
    }

    wsRef.current = webSocketService;
    
    wsRef.current.connect(reqId, {
      onStatus: (data) => {
        setStatus(data.data?.status || data.status);
      },
      onResult: (data) => {
        setResult(data.data);
        setStatus('completed');
        setIsLoading(false);
      },
      onError: (data) => {
        setError(data.message);
        setStatus('error');
        setIsLoading(false);
      }
    });
  };

  const reset = () => {
    setUrl('');
    setCompanyName('');
    setIsLoading(false);
    setStatus('');
    setResult(null);
    setError('');
    setRequestId(null);
    
    if (wsRef.current) {
      wsRef.current.disconnect();
    }
  };

  return {
    // State
    url,
    companyName,
    isLoading,
    status,
    result,
    error,
    requestId,
    
    // Actions
    setUrl,
    setCompanyName,
    startCrawl,
    reset
  };
};

/**
 * Hook for form validation
 * @param {Object} values - Form values to validate
 * @returns {Object} Validation state and methods
 */
export const useFormValidation = (values) => {
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    if (!values.url) {
      newErrors.url = 'URL is required';
    } else if (!isValidUrl(values.url)) {
      newErrors.url = 'Please enter a valid URL';
    }

    if (!values.companyName) {
      newErrors.companyName = 'Company name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  return {
    errors,
    validate,
    isValid: Object.keys(errors).length === 0
  };
};
