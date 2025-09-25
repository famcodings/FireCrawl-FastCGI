import React from 'react';
import PropTypes from 'prop-types';

/**
 * Document icon component for empty states and document representations
 */
const DocumentIcon = ({ size = 'w-12 h-12', className = '', ...props }) => {
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
        strokeWidth={1}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
};

DocumentIcon.propTypes = {
  size: PropTypes.string,
  className: PropTypes.string,
};

export default DocumentIcon;
