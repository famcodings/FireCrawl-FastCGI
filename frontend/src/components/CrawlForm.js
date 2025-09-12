/** Form component for crawl requests */
import { useState } from 'react';
import PropTypes from 'prop-types';

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
  const [focusedField, setFocusedField] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const validateUrl = (urlValue) => {
    if (!urlValue.trim()) return 'Website URL is required';
    
    try {
      const url = new URL(urlValue);
      
      // Check if protocol is http or https
      if (!['http:', 'https:'].includes(url.protocol)) {
        return 'URL must start with http:// or https://';
      }
      
      // Check if hostname exists and is valid
      if (!url.hostname || url.hostname.length < 3) {
        return 'Please enter a valid domain name';
      }
      
      // Check if hostname contains at least one dot (for TLD)
      if (!url.hostname.includes('.')) {
        return 'Please enter a complete domain (e.g., example.com)';
      }
      
      // Check if hostname ends with a valid TLD (at least 2 characters)
      const parts = url.hostname.split('.');
      const tld = parts[parts.length - 1];
      if (tld.length < 2) {
        return 'Please enter a valid top-level domain (e.g., .com, .org)';
      }
      
      // Check for localhost or IP addresses (might want to allow these in dev)
      if (url.hostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(url.hostname)) {
        // Allow localhost for development
        return null;
      }
      
      // Additional check: hostname should not be too short for a real domain
      if (url.hostname.replace(/\./g, '').length < 4) {
        return 'Please enter a complete website URL';
      }
      
      return null;
    } catch {
      return 'Please enter a valid URL (e.g., https://example.com)';
    }
  };

  const validateCompanyName = (nameValue) => {
    if (!nameValue.trim()) return 'Company name is required';
    if (nameValue.trim().length < 2) return 'Company name must be at least 2 characters';
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);

    const urlError = validateUrl(url);
    const companyError = validateCompanyName(companyName);

    const errors = {};
    if (urlError) errors.url = urlError;
    if (companyError) errors.companyName = companyError;

    setValidationErrors(errors);

    if (Object.keys(errors).length === 0) {
      onSubmit();
    }
  };

  const isFormValid = url.trim().length > 0 && companyName.trim().length > 0 && !validateUrl(url) && !validateCompanyName(companyName);

  return (
    <div className="glass-card p-8 md:p-10 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 via-transparent to-purple-400/5" />
      
      <div className="relative z-10">
        {/* Form header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Company Analysis
          </h2>
          <p className="text-white/70 text-lg">
            Enter a website URL to extract comprehensive business insights
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* URL Input */}
          <div className="space-y-3">
            <label 
              htmlFor="url" 
              className="block text-sm font-semibold text-white/90 tracking-wide uppercase"
            >
              Website URL
            </label>
            <div className="relative">
              <input
                type="url"
                id="url"
                value={url}
                onChange={(e) => onUrlChange(e.target.value)}
                onFocus={() => setFocusedField('url')}
                onBlur={() => setFocusedField(null)}
                placeholder="https://example.com"
                disabled={isLoading}
                className={`glass-input w-full pl-4 pr-4 py-4 text-gray-800 placeholder-gray-500 text-lg font-medium transition-all duration-300 ${
                  focusedField === 'url' ? 'scale-[1.02]' : ''
                } ${hasAttemptedSubmit && validationErrors.url ? 'border-red-400 bg-red-50/20' : ''}`}
                required
              />
            </div>
            
            {/* URL Help Text */}
            <p className="text-white/60 text-sm">
              Enter the company's website URL. We'll analyze all accessible pages to extract business insights.
            </p>
            
            {/* URL Error Message */}
            {hasAttemptedSubmit && validationErrors.url && (
              <div className="flex items-center space-x-2 text-red-300 text-sm">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{validationErrors.url}</span>
              </div>
            )}
          </div>

          {/* Company Name Input */}
          <div className="space-y-3">
            <label 
              htmlFor="companyName" 
              className="block text-sm font-semibold text-white/90 tracking-wide uppercase"
            >
              Company Name
            </label>
            <div className="relative">
              <input
                type="text"
                id="companyName"
                value={companyName}
                onChange={(e) => onCompanyNameChange(e.target.value)}
                onFocus={() => setFocusedField('company')}
                onBlur={() => setFocusedField(null)}
                placeholder="Enter company name"
                disabled={isLoading}
                className={`glass-input w-full pl-4 pr-4 py-4 text-gray-800 placeholder-gray-500 text-lg font-medium transition-all duration-300 ${
                  focusedField === 'company' ? 'scale-[1.02]' : ''
                } ${hasAttemptedSubmit && validationErrors.companyName ? 'border-red-400 bg-red-50/20' : ''}`}
                required
              />
            </div>
            
            {/* Company Name Help Text */}
            <p className="text-white/60 text-sm">
              Enter the exact name of the company you want to analyze. This helps us provide more accurate and contextual insights.
            </p>
            
            {/* Company Name Error Message */}
            {hasAttemptedSubmit && validationErrors.companyName && (
              <div className="flex items-center space-x-2 text-red-300 text-sm">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{validationErrors.companyName}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button 
              type="submit" 
              className={`glass-button flex-1 px-8 py-4 flex items-center justify-center space-x-3 text-lg font-semibold transition-all duration-300 ${
                !isFormValid ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={isLoading || !isFormValid}
            >
              {isLoading ? (
                <>
                  <div className="glass-spinner" />
                  <span>Analyzing Website...</span>
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M13 10V3L4 14h7v7l9-11h-7z" 
                    />
                  </svg>
                  <span>Start Analysis</span>
                </>
              )}
            </button>
            
            {(result || error) && (
              <button 
                type="button" 
                className="glass-button-secondary px-8 py-4 flex items-center justify-center space-x-3 text-lg font-semibold transition-all duration-300 hover:scale-105"
                onClick={onReset}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                  />
                </svg>
                <span>New Analysis</span>
              </button>
            )}
          </div>

          {/* Form Instructions */}
          <div className="bg-blue-500/10 border border-blue-400/30 rounded-2xl p-4 backdrop-blur-sm">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="space-y-2">
                <p className="text-blue-300 text-sm font-medium">
                  Analysis Process
                </p>
                <ul className="text-blue-200 text-sm space-y-1">
                  <li>• We'll analyze the website content and structure</li>
                  <li>• Extract industry, products, mission, and business insights</li>
                  <li>• Identify the company's unique selling proposition and target customers</li>
                  <li>• Results typically take 2-3 minutes to complete</li>
                </ul>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

CrawlForm.propTypes = {
  url: PropTypes.string.isRequired,
  companyName: PropTypes.string.isRequired,
  isLoading: PropTypes.bool.isRequired,
  result: PropTypes.object,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  onUrlChange: PropTypes.func.isRequired,
  onCompanyNameChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired
};

export default CrawlForm;