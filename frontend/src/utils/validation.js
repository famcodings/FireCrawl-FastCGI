/**
 * Validation utilities
 */
import { FORM_VALIDATION } from './constants';

/**
 * Validates if a string is a valid URL
 * @param {string} url - URL to validate
 * @returns {boolean} - Whether the URL is valid
 */
export const isValidUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return false;
  }

  if (url.length < FORM_VALIDATION.MIN_URL_LENGTH || url.length > FORM_VALIDATION.MAX_URL_LENGTH) {
    return false;
  }

  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Validates company name
 * @param {string} name - Company name to validate
 * @returns {boolean} - Whether the company name is valid
 */
export const isValidCompanyName = (name) => {
  if (!name || typeof name !== 'string') {
    return false;
  }

  const trimmedName = name.trim();
  return (
    trimmedName.length >= FORM_VALIDATION.MIN_COMPANY_NAME_LENGTH &&
    trimmedName.length <= FORM_VALIDATION.MAX_COMPANY_NAME_LENGTH
  );
};

/**
 * Gets validation error message for URL
 * @param {string} url - URL to validate
 * @returns {string|null} - Error message or null if valid
 */
export const getUrlError = (url) => {
  if (!url) {
    return 'URL is required';
  }

  if (url.length < FORM_VALIDATION.MIN_URL_LENGTH) {
    return 'URL is too short';
  }

  if (url.length > FORM_VALIDATION.MAX_URL_LENGTH) {
    return 'URL is too long';
  }

  if (!isValidUrl(url)) {
    return 'Please enter a valid URL (must start with http:// or https://)';
  }

  return null;
};

/**
 * Gets validation error message for company name
 * @param {string} name - Company name to validate
 * @returns {string|null} - Error message or null if valid
 */
export const getCompanyNameError = (name) => {
  if (!name || !name.trim()) {
    return 'Company name is required';
  }

  const trimmedName = name.trim();

  if (trimmedName.length < FORM_VALIDATION.MIN_COMPANY_NAME_LENGTH) {
    return 'Company name is too short';
  }

  if (trimmedName.length > FORM_VALIDATION.MAX_COMPANY_NAME_LENGTH) {
    return 'Company name is too long';
  }

  return null;
};
