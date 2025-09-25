import { useEffect } from 'react';

/**
 * Custom hook to prevent browser tab/window closing when operations are in progress
 * Shows a browser confirmation dialog when user tries to close/refresh the page
 * 
 * @param {boolean} when - Condition when to show the confirmation dialog
 * @param {string} message - Custom message (Note: Most modern browsers ignore custom messages)
 */
export const useBeforeUnload = (when, message = 'You have unsaved changes. Are you sure you want to leave?') => {
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (when) {
        // Prevent the default browser dialog
        e.preventDefault();
        
        // Chrome requires returnValue to be set
        e.returnValue = message;
        
        // Some browsers also look for a return value
        return message;
      }
    };

    if (when) {
      // Add event listener when condition is true
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    // Cleanup function - remove event listener
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [when, message]);
};
