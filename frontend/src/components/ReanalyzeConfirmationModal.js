import PropTypes from 'prop-types';
import ConfirmationModal from './ConfirmationModal';

/**
 * Modal wrapper confirming resource re-analysis.
 */
const ReanalyzeConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  resourceName = '',
  isLoading = false,
}) => (
  <ConfirmationModal
    isOpen={isOpen}
    onClose={onClose}
    onConfirm={onConfirm}
    title="Re-analyze Resource"
    description={`Are you sure you want to re-analyze "${resourceName}"? This will start a new analysis process.`}
    confirmLabel="Re-analyze"
    cancelLabel="Cancel"
    isLoading={isLoading}
  />
);

ReanalyzeConfirmationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  resourceName: PropTypes.string,
  isLoading: PropTypes.bool,
};

export default ReanalyzeConfirmationModal;
