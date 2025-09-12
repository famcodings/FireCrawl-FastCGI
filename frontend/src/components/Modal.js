/** Modal component for displaying detailed content */
import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  content, 
  icon = (
    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ), 
  color = 'bg-blue-500' 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll when modal is closed
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300); // Match animation duration
  }, [onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return createPortal(
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 transition-all duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-all duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`} 
      />
      
      {/* Modal content */}
      <div 
        className={`relative w-full max-w-6xl max-h-[95vh] bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl transition-all duration-300 ${
          isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20 flex-shrink-0">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center flex-shrink-0`}>
              {icon}
            </div>
            <h2 className="text-xl font-bold text-white truncate">{title}</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors duration-200 group flex-shrink-0 ml-3"
          >
            <svg 
              className="w-6 h-6 text-white/60 group-hover:text-white/90 transition-colors duration-200" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div
          className="
            flex flex-col flex-1 min-h-0
            overflow-y-auto overscroll-contain
            max-h-[70vh]
            sm:max-h-[75vh]
            md:max-h-[80vh]
            lg:max-h-[70vh]
          "
        >
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <div className="prose prose-invert max-w-none modal-content">
              <div className="text-white/90 leading-relaxed whitespace-pre-wrap break-words hyphens-auto">
                {content}
              </div>
            </div>
          </div>
          
          {/* Scroll indicator for very long content */}
          {content && content.length > 1000 && (
            <div className="px-6 py-2 text-center">
              <div className="text-xs text-white/50 flex items-center justify-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                </svg>
                <span>Scroll to read more</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-white/20 flex-shrink-0">
          <button
            onClick={handleClose}
            className="glass-button px-6 py-2 text-sm font-medium transition-all duration-300 hover:scale-105"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  icon: PropTypes.node,
  color: PropTypes.string
};

export default Modal;
