/**
 * Application constants
 */

export const API_ENDPOINTS = {
  CRAWL: '/api/crawl',
  STATUS: '/api/status',
  HEALTH: '/api/health',
};

export const WS_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  STATUS_UPDATE: 'status_update',
  RESULT: 'result',
  ERROR: 'error',
};

export const CRAWL_STATUS = {
  IDLE: 'idle',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  ERROR: 'error',
  CANCELLED: 'cancelled',
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

export const FORM_VALIDATION = {
  MIN_URL_LENGTH: 10,
  MAX_URL_LENGTH: 2048,
  MIN_COMPANY_NAME_LENGTH: 2,
  MAX_COMPANY_NAME_LENGTH: 100,
};

export const UI_CONSTANTS = {
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 5000,
  RETRY_ATTEMPTS: 3,
  CONNECTION_TIMEOUT: 10000,
};
