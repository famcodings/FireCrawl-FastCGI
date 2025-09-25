import PropTypes from 'prop-types';

/**
 * Reusable Button component with multiple variants and states
 */
const Button = ({
  children,
  onClick,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'medium',
  type = 'button',
  className = '',
  ...props
}) => {
  // Extract custom props to prevent them from being passed to DOM
  const { isLoading, ...domProps } = props;
  // Determine the base classes based on variant and state
  const getButtonClasses = () => {
    let baseClasses = 'font-semibold transition-all duration-300 ease-in-out focus:outline-none';
    
    // Size classes
    const sizeClasses = {
      small: 'py-2 px-4 text-sm rounded-xl',
      medium: 'py-3 px-6 text-base rounded-2xl',
      large: 'py-4 px-8 text-lg rounded-2xl'
    };
    
    // Variant classes
    let variantClasses = '';
    
    if (loading) {
      // Loading state uses shimmer animation
      variantClasses = 'glass-button-loading';
    } else if (variant === 'primary') {
      variantClasses = 'glass-button';
    } else if (variant === 'secondary') {
      variantClasses = 'glass-button-secondary';
    } else if (variant === 'danger') {
      variantClasses = 'glass-button-danger';
    }
    
    return `${baseClasses} ${sizeClasses[size]} ${variantClasses} ${className}`;
  };
  
  const handleClick = (e) => {
    if (!disabled && !loading && onClick) {
      onClick(e);
    }
  };
  
  return (
    <button
      type={type}
      className={getButtonClasses()}
      onClick={handleClick}
      disabled={disabled || loading}
      {...domProps}
    >
      {loading ? (
        <span className="flex items-center justify-center space-x-2">
          <span>{children}</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  className: PropTypes.string,
};

export default Button;
