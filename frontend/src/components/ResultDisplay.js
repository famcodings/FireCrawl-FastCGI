/** Component for displaying analysis results */
import { useState } from 'react';
import PropTypes from 'prop-types';
import Modal from './Modal';

const ResultDisplay = ({ result }) => {
  const [modalState, setModalState] = useState({ isOpen: false, title: '', content: '', icon: null, color: '' });

  if (!result) return null;

  const resultItems = [
    { 
      key: 'industry', 
      label: 'Industry', 
      icon: '🏢',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-400/30'
    },
    { 
      key: 'products_services', 
      label: 'Products & Services', 
      icon: '🛍️',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-400/30'
    },
    { 
      key: 'mission', 
      label: 'Mission Statement', 
      icon: '🎯',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-400/30'
    },
    { 
      key: 'usp', 
      label: 'Unique Selling Proposition', 
      icon: '⭐',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-400/30'
    },
    { 
      key: 'locations', 
      label: 'Locations', 
      icon: '📍',
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-400/30'
    },
    { 
      key: 'icp', 
      label: 'Ideal Customer Profile', 
      icon: '👥',
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-400/30'
    }
  ];

  const openModal = (key, label, icon, color) => {
    const content = result[key];
    if (content && content.trim().length > 0) {
      setModalState({
        isOpen: true,
        title: label,
        content: content,
        icon: icon,
        color: color
      });
    }
  };

  const closeModal = () => {
    setModalState({ isOpen: false, title: '', content: '', icon: null, color: '' });
  };

  return (
    <div className="glass-result p-8 md:p-10 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-400/5 via-transparent to-blue-400/5" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-glass">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white">Analysis Complete</h2>
          </div>
          <p className="text-white/80 text-lg">
            Here's what we discovered about the company
          </p>
        </div>
        
        {/* Results Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {resultItems.map(({ key, label, icon, color, bgColor, borderColor }, index) => {
            const value = result[key];
            const hasContent = value && value.trim().length > 0;
            // Show "Show More" if content is long enough to be truncated by line-clamp-3
            // Roughly 3 lines = ~150-200 characters depending on screen size
            const isLongContent = hasContent && (value.length > 100 || value.split(' ').length > 20);
            
            return (
              <div 
                key={key} 
                className={`glass-card p-6 transition-all duration-300 hover:scale-105 group ${bgColor} border ${borderColor} animate-scale-in`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Card header */}
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-glass group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-lg">{icon}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-white text-lg">{label}</h4>
                  </div>
                </div>

                {/* Card content */}
                <div className="mb-4">
                  {hasContent ? (
                    <p className="text-white/90 leading-relaxed line-clamp-3">
                      {value}
                    </p>
                  ) : (
                    <p className="text-white/50 italic">
                      Information not available
                    </p>
                  )}
                </div>

                {/* Show More button */}
                {isLongContent && (
                  <button
                    onClick={() => openModal(key, label, icon, color)}
                    className="glass-button px-4 py-2 text-sm font-medium flex items-center space-x-2 transition-all duration-300 hover:scale-105 hover:shadow-md"
                  >
                    <span>Show More</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary stats */}
        <div className="mt-8 pt-6 border-t border-white/20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {resultItems.filter(item => result[item.key] && result[item.key].trim().length > 0).length}
              </div>
              <div className="text-white/60 text-sm">Data Points</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {Object.values(result).join(' ').split(' ').length}
              </div>
              <div className="text-white/60 text-sm">Total Words</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {Math.round(Object.values(result).filter(v => v && v.trim()).length / resultItems.length * 100)}%
              </div>
              <div className="text-white/60 text-sm">Completeness</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                ✓
              </div>
              <div className="text-white/60 text-sm">Analysis Done</div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            className="glass-button px-6 py-3 flex items-center justify-center space-x-2"
            onClick={() => {
              const jsonData = JSON.stringify(result, null, 2);
              const blob = new Blob([jsonData], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'company-analysis.json';
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Download JSON</span>
          </button>
          
          <button 
            className="glass-button-secondary px-6 py-3 flex items-center justify-center space-x-2"
            onClick={() => {
              navigator.clipboard.writeText(JSON.stringify(result, null, 2));
              // You could add a toast notification here
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>Copy Data</span>
          </button>
        </div>
      </div>

      {/* Modal for detailed content */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.title}
        content={modalState.content}
        icon={modalState.icon}
        color={modalState.color}
      />
    </div>
  );
};

ResultDisplay.propTypes = {
  result: PropTypes.object
};

export default ResultDisplay;