import PropTypes from 'prop-types';

/**
 * Reusable Icon Button component
 * Provides consistent styling and behavior for icon-based action buttons
 */
const IconButton = ({
  icon: IconComponent,
  onClick,
  disabled = false,
  loading = false,
  variant = 'default',
  size = 'medium',
  className = '',
  title = '',
  tooltipText = '',
  children,
  ...props
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'danger':
        return 'hover:bg-red-50 text-red-500 group-hover:text-red-600';
      case 'primary':
        return 'hover:bg-blue-50 text-blue-500 group-hover:text-blue-600';
      case 'success':
        return 'hover:bg-green-50 text-green-500 group-hover:text-green-600';
      case 'warning':
        return 'hover:bg-yellow-50 text-yellow-500 group-hover:text-yellow-600';
      default:
        return 'hover:bg-gray-50 text-gray-500 group-hover:text-gray-600';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'p-1';
      case 'large':
        return 'p-2';
      default:
        return 'p-1';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 'w-3 h-3';
      case 'large':
        return 'w-6 h-6';
      default:
        return 'w-4 h-4';
    }
  };

  const handleClick = (e) => {
    if (!disabled && !loading && onClick) {
      onClick(e);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || loading}
      className={`
        relative group rounded transition-colors duration-200 
        disabled:opacity-50 disabled:cursor-not-allowed
        ${getSizeClasses()}
        ${getVariantClasses()}
        ${className}
      `}
      title={title}
      {...props}
    >
      {IconComponent && (
        <IconComponent 
          className={`${getIconSize()} ${loading ? 'animate-spin' : ''}`} 
        />
      )}
      
      {/* Tooltip */}
      {tooltipText && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
          {tooltipText}
        </div>
      )}
      
      {/* Loading spinner overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded">
          <div className="w-3 h-3 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"/>
        </div>
      )}
      
      {children}
    </button>
  );
};

IconButton.propTypes = {
  icon: PropTypes.elementType,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  variant: PropTypes.oneOf(['default', 'primary', 'danger', 'success', 'warning']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  className: PropTypes.string,
  title: PropTypes.string,
  tooltipText: PropTypes.string,
  children: PropTypes.node,
};

export default IconButton;
