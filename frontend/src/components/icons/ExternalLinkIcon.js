import React from 'react';
import PropTypes from 'prop-types';

/**
 * External link icon component to indicate links that open in new tabs
 */
const ExternalLinkIcon = ({ size = 'w-3 h-3', className = '', ...props }) => {
  return (
    <svg
      className={`${size} ${className}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
      />
    </svg>
  );
};

ExternalLinkIcon.propTypes = {
  size: PropTypes.string,
  className: PropTypes.string,
};

export default ExternalLinkIcon;
