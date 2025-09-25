import PropTypes from 'prop-types';
import ConfirmationModal from './ConfirmationModal';

/**
 * Modal wrapper confirming resource deletion.
 */
const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  resourceName,
  isLoading = false,
}) => (
  <ConfirmationModal
    isOpen={isOpen}
    onClose={onClose}
    onConfirm={onConfirm}
    title="Delete Resource"
    description={
      <>
        Are you sure you want to delete <strong>&quot;{resourceName}&quot;</strong>? This action cannot be undone.
      </>
    }
    confirmLabel="Delete"
    cancelLabel="Cancel"
    confirmVariant="danger"
    isLoading={isLoading}
  />
);

DeleteConfirmationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  resourceName: PropTypes.string.isRequired,
  isLoading: PropTypes.bool,
};

export default DeleteConfirmationModal;
