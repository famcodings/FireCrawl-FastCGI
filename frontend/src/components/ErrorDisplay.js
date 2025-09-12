/** Component for displaying error messages */
import React from 'react';
import PropTypes from 'prop-types';

const ErrorDisplay = ({ error }) => {
  if (!error) return null;

  // Parse error if it's a string or object
  const errorMessage = typeof error === 'string' ? error : error.message || 'An unexpected error occurred';
  const errorCode = error.code || null;

  return (
    <div className="glass-status-error p-6 md:p-8 relative overflow-hidden animate-scale-in">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-400/20 via-transparent to-pink-400/20" />
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-red-500 flex items-center justify-center shadow-glass">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-3">
              <h3 className="text-xl font-bold text-red-800">
                Analysis Error
              </h3>
              {errorCode && (
                <span className="px-2 py-1 text-xs font-mono bg-red-200/50 text-red-700 rounded-lg">
                  {errorCode}
                </span>
              )}
            </div>
            
            <p className="text-red-700 leading-relaxed mb-4">
              {errorMessage}
            </p>

            {/* Troubleshooting tips */}
            <div className="bg-red-50/30 rounded-xl p-4 backdrop-blur-sm border border-red-200/50">
              <h4 className="font-semibold text-red-800 mb-2 flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span>Troubleshooting Tips</span>
              </h4>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Make sure the URL is valid and accessible</li>
                <li>• Check your internet connection</li>
                <li>• Try again in a few moments</li>
                <li>• Contact support if the issue persists</li>
              </ul>
            </div>

            {/* Retry suggestion */}
            <div className="mt-4 text-sm text-red-600">
              <span className="font-medium">Suggestion:</span> Please verify the website URL and try your analysis again.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

ErrorDisplay.propTypes = {
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
};

export default ErrorDisplay;