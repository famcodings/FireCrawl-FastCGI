/**
 * Environment configuration
 * Centralized configuration for different environments
 */

const config = {
  development: {
    API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000',
    WS_URL: process.env.REACT_APP_WS_URL || 'ws://localhost:8000',
    APP_NAME: process.env.REACT_APP_NAME || 'InfoBud PoC',
    VERSION: process.env.REACT_APP_VERSION || '1.0.0',
    DEBUG: true,
  },
  production: {
    API_BASE_URL: process.env.REACT_APP_API_BASE_URL || '/api',
    WS_URL: process.env.REACT_APP_WS_URL || `ws://${window.location.host}`,
    APP_NAME: process.env.REACT_APP_NAME || 'InfoBud PoC',
    VERSION: process.env.REACT_APP_VERSION || '1.0.0',
    DEBUG: false,
  },
  test: {
    API_BASE_URL: 'http://localhost:8000',
    WS_URL: 'ws://localhost:8000',
    APP_NAME: 'InfoBud PoC Test',
    VERSION: '1.0.0',
    DEBUG: false,
  },
};

const environment = process.env.NODE_ENV || 'development';

export default config[environment];
export { config };
