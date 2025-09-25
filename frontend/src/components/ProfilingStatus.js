/** Component for displaying profiling status */
import PropTypes from 'prop-types';

const ProfilingStatus = ({ status, companyName, url }) => {
  if (!status) return null;

  const getStatusContent = () => {
    switch (status) {
      case 'processing':
        return {
          icon: (
            <div className="relative">
              <svg className="w-6 h-6 animate-spin text-orange-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
            </div>
          ),
          title: 'Analyzing Website',
          message: 'Our AI is crawling the website and extracting comprehensive business insights. This may take a few minutes.',
          className: 'glass-status-processing',
          gradient: 'bg-orange-400/60'
        };
      case 'completed':
        return {
          icon: (
            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ),
          title: 'Analysis Complete',
          message: 'Successfully extracted all company information and business insights.',
          className: 'glass-status-completed',
          gradient: 'bg-emerald-400/60'
        };
      case 'error':
        return {
          icon: (
            <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          ),
          title: 'Analysis Failed',
          message: 'There was an issue analyzing the website. Please check the URL and try again.',
          className: 'glass-status-error',
          gradient: 'bg-red-400/50'
        };
      default:
        return {
          icon: (
            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          ),
          title: 'Status Update',
          message: `Current status: ${status}`,
          className: 'glass-card',
          gradient: 'from-blue-400/20 via-transparent to-indigo-400/20'
        };
    }
  };

  const { icon, title, message, className, gradient } = getStatusContent();

  return (
    <div className={`${className} p-6 md:p-8 relative overflow-hidden animate-scale-in`}>
      {/* Background gradient */}
      <div className={`absolute inset-0 ${gradient.startsWith('bg-') ? gradient : `bg-gradient-to-br ${gradient}`}`} />
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 mt-1">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              {title}
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              {message}
            </p>
            
            {/* Company Information - only show when not completed */}
            {(companyName || url) && status !== 'completed' && (
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h4 className="text-sm font-semibold text-gray-800">
                    {companyName || 'Company'}
                  </h4>
                </div>
                {url && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <a 
                      href={url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-500 transition-colors duration-200 underline text-sm"
                    >
                      {url}
                    </a>
                  </div>
                )}
              </div>
            )}
            
            {/* Progress indicator for processing */}
            {status === 'processing' && (
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>Analyzing...</span>
                </div>
                <div className="w-full bg-orange-200/50 rounded-full h-2 overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full progress-shimmer" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

ProfilingStatus.propTypes = {
  status: PropTypes.string.isRequired,
  companyName: PropTypes.string,
  url: PropTypes.string
};

export default ProfilingStatus;