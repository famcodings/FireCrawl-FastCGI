import { useState } from 'react';
import PropTypes from 'prop-types';
import AddResourceModal from './AddResourceModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import ReanalyzeConfirmationModal from './ReanalyzeConfirmationModal';
import Button from './Button';
import IconButton from './IconButton';
import StatusIndicator from './StatusIndicator';
import { DocumentIcon, ExternalLinkIcon, TrashIcon, RefreshIcon } from './icons';
import { RESOURCE_STATUS, RESOURCE_TYPE } from '../utils/constants';
import { apiService } from '../services';
import toast from 'react-hot-toast';

const Resources = ({ resources, onAddResource, isLoading, onResourcesRefresh, onResourceUpdated }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingResourceId, setDeletingResourceId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    resource: null
  });
  const [reanalyzingResourceId, setReanalyzingResourceId] = useState(null);
  const [reanalyzeModal, setReanalyzeModal] = useState({
    isOpen: false,
    resource: null
  });

  const handleDeleteClick = (resource) => {
    setDeleteModal({
      isOpen: true,
      resource: resource
    });
  };

  const handleConfirmDelete = async () => {
    const { resource } = deleteModal;
    if (!resource) return;

    setDeletingResourceId(resource.id);
    try {
      await apiService.deleteResource(resource.id, resource.type);
      toast.success('Resource deleted successfully');
      // Call the parent callback to refresh resources
      if (onResourcesRefresh) {
        await onResourcesRefresh();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to delete resource');
    } finally {
      setDeletingResourceId(null);
      setDeleteModal({ isOpen: false, resource: null });
    }
  };

  const handleCancelDelete = () => {
    setDeleteModal({ isOpen: false, resource: null });
  };

  const handleReanalyzeConfirm = async () => {
    const { resource } = reanalyzeModal;
    if (!resource) return;

    setReanalyzingResourceId(resource.id);
    try {
      const response = await apiService.reanalyzeResource(resource.id, resource.type);
      toast.success('Resource re-analysis started successfully');
      if (onResourceUpdated && response?.resource) {
        onResourceUpdated(response.resource);
      } else if (onResourcesRefresh) {
        await onResourcesRefresh();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to start re-analysis');
    } finally {
      setReanalyzingResourceId(null);
      setReanalyzeModal({ isOpen: false, resource: null });
    }
  };

  const handleReanalyzeCancel = () => {
    setReanalyzeModal({ isOpen: false, resource: null });
  };

  const handleReanalyzeButtonClick = (resource) => {
    setReanalyzeModal({
      isOpen: true,
      resource: resource
    });
  };

  const isReanalyzeDisabled = (resource) => {
    const status = resource.status || RESOURCE_STATUS.PENDING;
    return status === RESOURCE_STATUS.PROCESSING || status === RESOURCE_STATUS.PENDING;
  };

  const isReanalyzeSupported = (resource) => {
    return [RESOURCE_TYPE.URL, RESOURCE_TYPE.PDF].includes(resource.type);
  };

  return (
    <div className="glass-card p-8 md:p-10 mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Resources</h2>
        <Button onClick={() => setIsModalOpen(true)} size="medium">
          Add
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-gray-800">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-3 px-4 text-left">Name</th>
              <th className="py-3 px-4 text-left">Type</th>
              <th className="py-3 px-4 text-left">URL/Filename</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {resources.length > 0 ? (
              resources.map(resource => (
                <tr key={resource.id} className="border-b border-gray-100">
                  <td className="py-3 px-4">{resource.name}</td>
                  <td className="py-3 px-4">{resource.type}</td>
                  <td className="py-3 px-4">
                    {resource.type === RESOURCE_TYPE.URL ? (
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orange-500 hover:text-orange-600 hover:underline inline-flex items-center gap-1"
                      >
                        <span>{resource.url}</span>
                        <ExternalLinkIcon className="text-orange-400" />
                      </a>
                    ) : resource.file_url ? (
                      <a
                        href={`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}${resource.file_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orange-500 hover:text-orange-600 hover:underline inline-flex items-center gap-1"
                      >
                        <span>{resource.filename || resource.name}</span>
                        <ExternalLinkIcon className="text-orange-400" />
                      </a>
                    ) : (
                      <span className="text-gray-500">
                        {resource.filename || resource.url || resource.name}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <StatusIndicator
                      status={resource.status || RESOURCE_STATUS.PENDING}
                      lastAnalysisAt={
                        resource.type === RESOURCE_TYPE.URL
                          ? resource.last_analysis_at
                          : undefined
                      }
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      {isReanalyzeSupported(resource) && (
                        <IconButton
                          icon={RefreshIcon}
                          onClick={() => handleReanalyzeButtonClick(resource)}
                          disabled={isReanalyzeDisabled(resource)}
                          loading={reanalyzingResourceId === resource.id}
                          variant="primary"
                          title={isReanalyzeDisabled(resource) ? "Resource is already being processed" : "Re-analyze resource"}
                          tooltipText={isReanalyzeDisabled(resource) ? "Already processing" : `Re-analyze ${resource.name}`}
                        />
                      )}
                      <IconButton
                        icon={TrashIcon}
                        onClick={() => handleDeleteClick(resource)}
                        disabled={deletingResourceId === resource.id || isLoading}
                        loading={deletingResourceId === resource.id}
                        variant="danger"
                        title="Delete resource"
                        tooltipText={`Delete ${resource.name}`}
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="py-8 px-4 text-center text-gray-500">
                  <div className="flex flex-col items-center space-y-2">
                    <DocumentIcon className="text-gray-300" />
                    <p className="text-gray-600 font-medium">
                      No resources added yet
                    </p>
                    <p className="text-gray-400 text-sm">
                      Click "Add" to upload your first document or URL
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <AddResourceModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAddResource={onAddResource}
          isLoading={isLoading}
        />
      )}

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        resourceName={deleteModal.resource?.name || ''}
        isLoading={deletingResourceId === deleteModal.resource?.id}
      />

      <ReanalyzeConfirmationModal
        isOpen={reanalyzeModal.isOpen}
        onClose={handleReanalyzeCancel}
        onConfirm={handleReanalyzeConfirm}
        resourceName={reanalyzeModal.resource?.name || ''}
        isLoading={reanalyzingResourceId === reanalyzeModal.resource?.id}
      />
    </div>
  );
};

Resources.propTypes = {
  resources: PropTypes.array.isRequired,
  onAddResource: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  onResourcesRefresh: PropTypes.func,
  onResourceUpdated: PropTypes.func,
};

export default Resources;
