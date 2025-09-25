import React from 'react';
import PropTypes from 'prop-types';
import { SpinnerIcon, CheckMarkIcon, FailedIcon } from './icons';
import { RESOURCE_STATUS, VALID_STATUSES } from '../utils/constants';

/**
 * Status indicator component with icon and tooltip
 */
const StatusIndicator = ({ status = RESOURCE_STATUS.PENDING, lastAnalysisAt, className = '' }) => {
  
  // Format last analysis time for display
  const formatAnalysisTime = (isoString) => {
    if (!isoString) return null;
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const analysisTime = formatAnalysisTime(lastAnalysisAt);
  
  const statusConfig = {
    [RESOURCE_STATUS.PENDING]: {
      icon: SpinnerIcon,
      label: 'Pending',
      tooltip: 'Waiting to be processed',
      iconClass: 'text-gray-400'
    },
    [RESOURCE_STATUS.PROCESSING]: {
      icon: SpinnerIcon,
      label: 'Processing',
      tooltip: `Processing - extracting data from resource${analysisTime ? ` (started ${analysisTime})` : ''}`,
      iconClass: 'text-orange-500 animate-spin'
    },
    [RESOURCE_STATUS.READY]: {
      icon: CheckMarkIcon,
      label: 'Ready',
      tooltip: `Ready - data extracted successfully${analysisTime ? ` (completed ${analysisTime})` : ''}`,
      iconClass: 'text-green-500'
    },
    [RESOURCE_STATUS.FAILED]: {
      icon: FailedIcon,
      label: 'Failed',
      tooltip: `Failed - analysis could not be completed${analysisTime ? ` (failed ${analysisTime})` : ''}`,
      iconClass: 'text-red-500'
    }
  };

  const config = statusConfig[status] || statusConfig[RESOURCE_STATUS.PENDING];
  const IconComponent = config.icon;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="relative group">
        <IconComponent className={config.iconClass} />
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
          {config.tooltip}
        </div>
      </div>
      <span className="text-sm text-gray-600">
        {config.label}
      </span>
    </div>
  );
};

StatusIndicator.propTypes = {
  status: PropTypes.oneOf(VALID_STATUSES),
  lastAnalysisAt: PropTypes.string, // ISO date string
  className: PropTypes.string,
};

export default StatusIndicator;
