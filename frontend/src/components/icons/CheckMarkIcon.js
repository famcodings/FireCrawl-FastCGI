import React from 'react';
import PropTypes from 'prop-types';

/**
 * Check mark icon component for success/ready states
 */
const CheckMarkIcon = ({ size = 'w-4 h-4', className = '', ...props }) => {
  return (
    <svg
      className={`${size} ${className}`}
      fill="currentColor"
      viewBox="0 0 20 20"
      {...props}
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  );
};

CheckMarkIcon.propTypes = {
  size: PropTypes.string,
  className: PropTypes.string,
};

export default CheckMarkIcon;
