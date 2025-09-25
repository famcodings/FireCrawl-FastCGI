/**
 * Application constants and enums for the frontend
 */

/**
 * Resource status constants - must match backend ResourceStatus enum
 */
export const RESOURCE_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  READY: 'ready',
  FAILED: 'failed'
};

/**
 * All valid status values for validation
 */
export const VALID_STATUSES = Object.values(RESOURCE_STATUS);

/**
 * Default status for new resources
 */
export const DEFAULT_STATUS = RESOURCE_STATUS.PENDING;

/**
 * Check if a status string is valid
 * @param {string} status - Status to validate
 * @returns {boolean} True if valid
 */
export const isValidStatus = (status) => {
  return VALID_STATUSES.includes(status);
};

/**
 * Resource type constants
 */
export const RESOURCE_TYPE = {
  URL: 'URL',
  PDF: 'PDF'
};

/**
 * All valid resource types
 */
export const VALID_RESOURCE_TYPES = Object.values(RESOURCE_TYPE);