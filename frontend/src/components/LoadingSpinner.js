import React from 'react';
import PropTypes from 'prop-types';

/**
 * Reusable loading spinner component with glass morphism and modern animations
 */
const LoadingSpinner = ({ 
  size = 'medium', 
  text = 'Loading...', 
  className = '',
  inline = false,
  variant = 'default'
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const variants = {
    default: 'border-white/30 border-t-white',
    blue: 'border-blue-200/30 border-t-blue-400',
    purple: 'border-purple-200/30 border-t-purple-400',
    gradient: 'border-transparent bg-gradient-to-r from-blue-400 to-purple-500'
  };

  const containerClass = inline 
    ? 'inline-flex items-center space-x-2' 
    : 'flex flex-col items-center justify-center p-8';

  if (variant === 'dots') {
    return (
      <div className={`${containerClass} ${className}`}>
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        {text && (
          <p className={`text-white/90 font-medium ${inline ? 'text-sm ml-3' : 'text-base mt-3'}`}>
            {text}
          </p>
        )}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={`${containerClass} ${className}`}>
        <div className={`${sizeClasses[size]} bg-white/20 rounded-full animate-pulse`}></div>
        {text && (
          <p className={`text-white/90 font-medium ${inline ? 'text-sm' : 'text-base mt-3'}`}>
            {text}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`${containerClass} ${className}`}>
      <div className="relative">
        {variant === 'gradient' ? (
          <div className={`${sizeClasses[size]} rounded-full ${variants[variant]} animate-spin`}></div>
        ) : (
          <div className={`${sizeClasses[size]} border-2 ${variants[variant]} rounded-full animate-spin`}></div>
        )}
        
        {/* Optional inner ring for enhanced effect */}
        {size === 'large' || size === 'xl' ? (
          <div className="absolute inset-2 border border-white/10 rounded-full"></div>
        ) : null}
      </div>
      
      {text && (
        <p className={`text-white/90 font-medium ${inline ? 'text-sm' : 'text-base mt-3'} animate-pulse`}>
          {text}
        </p>
      )}
    </div>
  );
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large', 'xl']),
  text: PropTypes.string,
  className: PropTypes.string,
  inline: PropTypes.bool,
  variant: PropTypes.oneOf(['default', 'blue', 'purple', 'gradient', 'dots', 'pulse'])
};

export default LoadingSpinner;