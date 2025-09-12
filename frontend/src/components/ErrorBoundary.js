import React from 'react';

/**
 * Error Boundary component to catch JavaScript errors in the component tree
 * and display a fallback UI instead of crashing the entire app
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // You can also log the error to an error reporting service here
    // Example: errorReportingService.captureException(error);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-cosmic flex items-center justify-center p-4">
          <div className="glass-error-boundary p-8 max-w-2xl w-full">
            <div className="text-center">
              <div className="text-6xl mb-4">🚨</div>
              <h2 className="text-2xl font-bold text-red-800 mb-4">Something went wrong</h2>
              <p className="text-red-700 mb-8 leading-relaxed">
                We're sorry! Something unexpected happened. Please try refreshing the page.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={this.handleReset}
                  className="glass-button px-6 py-3 flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Try Again</span>
                </button>
                <button 
                  onClick={() => window.location.reload()}
                  className="glass-button-secondary px-6 py-3 flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <span>Refresh Page</span>
                </button>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="glass-card mt-8 p-4 text-left">
                  <summary className="cursor-pointer font-semibold mb-3 text-gray-800">
                    Error Details (Development Only)
                  </summary>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap">
                    {this.state.error.toString()}
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
