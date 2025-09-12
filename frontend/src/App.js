/** Main App component */
import React from 'react';
import './index.css';

// Components
import ErrorBoundary from './components/ErrorBoundary';
import Header from './components/Header';
import CrawlForm from './components/CrawlForm';
import StatusDisplay from './components/StatusDisplay';
import ErrorDisplay from './components/ErrorDisplay';
import ResultDisplay from './components/ResultDisplay';

// Hooks
import { useCrawl } from './hooks/useCrawl';

// Configuration
import environment from './config/environment';

// Floating background elements component
const FloatingElements = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Floating geometric shapes */}
      <div className="floating-icon top-20 left-10 animate-delay-100">
        <div className="w-16 h-16 rounded-full bg-white/5 backdrop-blur-sm" />
      </div>
      <div className="floating-icon top-40 right-20 animate-delay-200">
        <div className="w-12 h-12 rounded-2xl bg-blue-400/10 backdrop-blur-sm rotate-45" />
      </div>
      <div className="floating-icon bottom-32 left-16 animate-delay-300">
        <div className="w-20 h-20 rounded-3xl bg-purple-400/8 backdrop-blur-sm" />
      </div>
      <div className="floating-icon bottom-20 right-32 animate-delay-500">
        <div className="w-14 h-14 rounded-full bg-indigo-400/10 backdrop-blur-sm" />
      </div>
      <div className="floating-icon top-60 left-1/3 animate-delay-300">
        <div className="w-10 h-10 rounded-xl bg-pink-400/8 backdrop-blur-sm rotate-12" />
      </div>
      <div className="floating-icon bottom-40 right-1/4 animate-delay-100">
        <div className="w-18 h-18 rounded-2xl bg-teal-400/8 backdrop-blur-sm -rotate-12" />
      </div>
    </div>
  );
};

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
    <ErrorBoundary>
      <div className="min-h-screen relative">
        {/* Floating background elements */}
        <FloatingElements />
        
        {/* Main content */}
        <div className="relative z-10">
          <div className="container mx-auto px-4 py-8 max-w-5xl">
            {/* Header with animation */}
            <div className="animate-fade-in">
              <Header appName={environment.APP_NAME} version={environment.VERSION} />
            </div>
            
            {/* Main content area */}
            <main className="space-y-8 mt-8">
              {/* Form section */}
              <div className="animate-slide-up animate-delay-100">
                <CrawlForm
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

              {/* Status and results section */}
              <div className="space-y-6">
                {/* Status display */}
                {status && (
                  <div className="animate-scale-in animate-delay-200">
                    <StatusDisplay status={status} />
                  </div>
                )}

                {/* Error display */}
                {error && (
                  <div className="animate-scale-in animate-delay-300">
                    <ErrorDisplay error={error} />
                  </div>
                )}
                
                {/* Results display */}
                {result && (
                  <div className="animate-slide-up animate-delay-200">
                    <ResultDisplay result={result} />
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
    </ErrorBoundary>
  );
}

export default App;