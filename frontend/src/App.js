/** Main App component */
import './index.css';

// Components
import Header from './components/Header';
import ProfilingForm from './components/ProfilingForm';
import ProfilingStatus from './components/ProfilingStatus';
import ProfileDisplay from './components/ProfileDisplay';

// Hooks
import { useCrawl } from './hooks/useCrawl';

// Configuration
import environment from './config/environment';

function App() {
  const {
    url,
    companyName,
    isLoading,
    status,
    result,
    error,
    setUrl,
    setCompanyName,
    startCrawl,
    reset
  } = useCrawl();

  return (
    <div className="min-h-screen relative">
      
      {/* Main content */}
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          {/* Header with animation */}
          <div className="animate-fade-in">
            <Header appName={environment.APP_NAME} version={environment.VERSION} />
          </div>
          
          {/* Main content area */}
          <main className="space-y-8 mt-8 transition-all duration-700 ease-out">
            {/* Form section - show when idle or error, hide when processing or complete */}
            {!status && !result && (
              <div className="animate-gentle-bounce animate-delay-100 transition-all duration-700 ease-out">
                <ProfilingForm
                  url={url}
                  companyName={companyName}
                  isLoading={isLoading}
                  result={result}
                  error={error}
                  onUrlChange={setUrl}
                  onCompanyNameChange={setCompanyName}
                  onSubmit={startCrawl}
                  onReset={reset}
                />
              </div>
            )}

            {/* Status and results section */}
            <div className="space-y-6 transition-all duration-700 ease-out">
              {/* Status display */}
              {status && (
                <div className="animate-smooth-fade-slide animate-delay-200 transition-all duration-500">
                  <ProfilingStatus status={status} companyName={companyName} url={url} />
                </div>
              )}

              {/* Simple error display */}
              {error && (
                <div className="animate-scale-in animate-delay-300 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded transition-all duration-500 hover:shadow-md">
                  <strong>Error:</strong> {typeof error === 'string' ? error : error.message || 'An error occurred'}
                </div>
              )}
                
              {/* Results display */}
              {result && (
                <div className="animate-gentle-bounce animate-delay-200 transition-all duration-700">
                  <ProfileDisplay result={result} companyName={companyName} url={url} />
                </div>
              )}

              {/* Start Another Analysis button */}
              {result && (
                <div className="text-center animate-smooth-fade-slide animate-delay-400 mt-8">
                  <button
                    onClick={() => {
                      reset();
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="glass-button px-8 py-4 text-lg font-semibold flex items-center justify-center space-x-3 mx-auto transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:-translate-y-1 active:scale-105 active:translate-y-0"
                  >
                    <svg className="w-6 h-6 transition-transform duration-300 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Start Another Analysis</span>
                  </button>
                </div>
              )}
            </div>
          </main>

          {/* Footer */}
          <footer className="mt-16 text-center animate-fade-in animate-delay-500">
            <div className="glass-card p-6 inline-block">
              <p className="text-white/70 text-sm">
                Powered by{' '}
                <span className="text-shimmer font-semibold">{environment.APP_NAME}</span>
                {' '}• Built with ❤️
              </p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default App;