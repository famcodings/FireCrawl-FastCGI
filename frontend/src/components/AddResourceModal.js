import React, { useState } from 'react';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import FormModal from './FormModal';
import Button from './Button';
import FormField from './FormField';

const AddResourceModal = ({ isOpen, onClose, onAddResource, isLoading }) => {
    const [type, setType] = useState('');
    const [name, setName] = useState('');
    const [url, setUrl] = useState('');
    const [files, setFiles] = useState(null);

    // Reset form when modal opens
    const resetForm = () => {
        setType('');
        setName('');
        setUrl('');
        setFiles(null);
    };

    // Reset form when modal opens/closes
    React.useEffect(() => {
        if (isOpen) {
            resetForm();
        }
    }, [isOpen]);

    const validateForm = () => {
        if (!type) {
            toast.error('Please select a resource type');
            return false;
        }
        
        if (!name.trim()) {
            toast.error('Please enter a resource name');
            return false;
        }
        
        if (type === 'url') {
            if (!url.trim()) {
                toast.error('Please enter a URL');
                return false;
            }
            // Basic URL validation
            try {
                new URL(url);
            } catch {
                toast.error('Please enter a valid URL');
                return false;
            }
        } else {
            if (!files || files.length === 0) {
                toast.error('Please select at least one file');
                return false;
            }
            // Validate file types
            for (let file of files) {
                if (file.type !== 'application/pdf') {
                    toast.error(`${file.name} is not a PDF file`);
                    return false;
                }
            }
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        const formData = new FormData();
        formData.append('name', name);
        formData.append('type', type);
        
        if (type === 'url') {
            formData.append('url', url);
        } else {
            for (let i = 0; i < files.length; i++) {
                formData.append('files', files[i]);
            }
        }

        try {
            await onAddResource(formData);
            // Only close modal if the resource was added successfully
            onClose();
            resetForm();
        } catch (error) {
            // Error handling is done in the useSupplier hook with toast
            // Modal stays open so user can correct the issue
        }
    };

    return (
      <FormModal 
        isOpen={isOpen} 
        onClose={onClose} 
        title="Add Resource"
        disabled={isLoading}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 tracking-wide uppercase">Resource Type *</label>
            <select 
              value={type} 
              onChange={(e) => setType(e.target.value)} 
              className="glass-input w-full py-3 px-3 text-base"
              disabled={isLoading}
              required
            >
              <option value="" disabled={type !== ''}>Select resource type</option>
              <option value="url">Website URL</option>
              <option value="pdf">PDF Document</option>
            </select>
          </div>
          
          {type && (
            <FormField
              label="Name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              required
              className="mt-1"
            />
          )}
          
          {type === 'url' && (
            <FormField
              label="URL"
              name="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isLoading}
              required
              className="mt-1"
            />
          )}
          
          {type === 'pdf' && (
            <div className="space-y-2">
              <label htmlFor="files" className="block text-sm font-semibold text-gray-700 tracking-wide uppercase">
                PDF File(s) *
              </label>
              <input 
                type="file" 
                id="files" 
                onChange={(e) => setFiles(e.target.files)} 
                className="glass-input w-full py-3 px-3 text-base" 
                accept=".pdf,application/pdf"
                disabled={isLoading}
                multiple 
                required 
              />
              <p className="text-xs text-gray-500 mt-1">
                Only PDF files are accepted. You can select multiple files.
              </p>
            </div>
          )}
          
          {type && (
            <div className="pt-4 flex justify-end">
              <Button
                type="submit"
                loading={isLoading}
                size="medium"
              >
                {isLoading ? 'Adding...' : 'Add Resource'}
              </Button>
            </div>
          )}
        </form>
      </FormModal>
    );
};

AddResourceModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onAddResource: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
};

export default AddResourceModal;
