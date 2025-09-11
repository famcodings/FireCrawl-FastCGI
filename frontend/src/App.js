/** Main App component */
import React from 'react';
import './index.css';

// Components
import Header from './components/Header';
import CrawlForm from './components/CrawlForm';
import StatusDisplay from './components/StatusDisplay';
import ErrorDisplay from './components/ErrorDisplay';
import ResultDisplay from './components/ResultDisplay';

// Hooks
import { useCrawl } from './hooks/useCrawl';

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
    <div className="container">
      <Header />
      
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

      <StatusDisplay status={status} />
      
      <ErrorDisplay error={error} />
      
      <ResultDisplay result={result} />
    </div>
  );
}

export default App;