import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import Button from './Button';

/**
 * Base confirmation modal used by specific modal variants.
 */
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancel',
  confirmVariant = 'primary',
  isLoading = false,
  overlayClassName = '',
  contentClassName = '',
  children,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose, isLoading]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const descriptionContent = (() => {
    if (!description) return null;

    if (typeof description === 'string') {
      return <p className="text-gray-600 mb-8">{description}</p>;
    }

    return <div className="text-gray-600 mb-8">{description}</div>;
  })();

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm ${overlayClassName}`}
      onClick={handleBackdropClick}
    >
      <div className={`relative w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl border border-white/30 shadow-2xl animate-modal-enter ${contentClassName}`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button
            onClick={isLoading ? undefined : onClose}
            disabled={isLoading}
            className={`p-1 rounded-lg transition-colors duration-200 ${
              isLoading
                ? 'cursor-not-allowed opacity-50'
                : 'hover:bg-gray-100 cursor-pointer'
            }`}
            type="button"
          >
            <svg
              className={`w-5 h-5 ${
                isLoading
                  ? 'text-gray-300'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 text-center">
          {children ?? (
            <>
              {descriptionContent}
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={onClose}
                  variant="secondary"
                  disabled={isLoading}
                >
                  {cancelLabel}
                </Button>
                <Button
                  onClick={onConfirm}
                  variant={confirmVariant}
                  loading={isLoading}
                  isLoading={isLoading}
                >
                  {confirmLabel}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

ConfirmationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  confirmLabel: PropTypes.string.isRequired,
  cancelLabel: PropTypes.string,
  confirmVariant: PropTypes.oneOf(['primary', 'secondary', 'danger']),
  isLoading: PropTypes.bool,
  overlayClassName: PropTypes.string,
  contentClassName: PropTypes.string,
  children: PropTypes.node,
};

export default ConfirmationModal;
