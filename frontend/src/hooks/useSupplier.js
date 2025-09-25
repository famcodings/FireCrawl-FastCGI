import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { apiService } from '../services';
import { useBeforeUnload } from './useBeforeUnload';

export const useSupplier = () => {
    const [supplier, setSupplier] = useState(null);
    const [resources, setResources] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(true);
    const hasLoadedInitially = useRef(false);

    const loadExistingSupplier = async () => {
        setIsInitialLoading(true);
        setError(null);
        try {
            const supplier = await apiService.getSupplier();
            if (supplier) {
                // Load the existing supplier
                setSupplier(supplier);
                setIsEditing(false);
                
                // Load resources for this supplier
                try {
                    const resources = await apiService.getResources();
                    setResources(resources || []);
                } catch (resourceError) {
                    // Silently handle resource loading errors during initial load
                    setResources([]); // Set empty array on error
                    // Don't toast for resource loading errors during initial load
                }
            } else {
                // No supplier found, start with create mode
                setIsEditing(true);
                setResources([]);
            }
        } catch (err) {
            // If there's an error loading supplier, just start fresh
            setIsEditing(true);
            setResources([]);
            // Only show toast if it's not a 404 (no supplier found)
            if (!err.message?.includes('No supplier found')) {
                toast.error('Failed to load supplier data');
            }
        } finally {
            setIsInitialLoading(false);
        }
    };

    const refreshResources = async () => {
        try {
            const latestResources = await apiService.getResources();
            setResources(latestResources || []);
        } catch (err) {
            const errorMessage = err.message || 'Failed to load resources';
            setError(errorMessage);
            toast.error(errorMessage);
        }
    };

    // Load existing supplier on component mount
    useEffect(() => {
        if (!hasLoadedInitially.current) {
            hasLoadedInitially.current = true;
            loadExistingSupplier();
        }
    }, []);

    // Prevent closing browser tab when API requests are in progress
    useBeforeUnload(isLoading, 'An operation is in progress. Are you sure you want to leave? Your changes may be lost.');

    const saveSupplier = async (supplierData) => {
        setIsLoading(true);
        setError(null);
        try {
            const savedSupplier = await apiService.saveSupplier(supplierData);
            setSupplier(savedSupplier);
            setIsEditing(false);
            
            // Show success toast
            if (supplier?.id) {
                toast.success('Supplier updated successfully!');
            } else {
                toast.success('Supplier created successfully!');
            }
            
            return savedSupplier;
        } catch (err) {
            const errorMessage = err.message || 'Failed to save supplier';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const addResource = async (resourceData) => {
        setIsLoading(true);
        setError(null);
        try {
            // FormData will be constructed in the component
            const newResource = await apiService.addResource(resourceData);
            setResources(prev => [...prev, newResource]);
            
            // Show success toast
            toast.success('Resource added successfully!');
        } catch (err) {
            const errorMessage = err.message || 'Failed to add resource';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const upsertResource = (updatedResource) => {
        if (!updatedResource || typeof updatedResource.id === 'undefined') {
            return;
        }

        setResources(prev => {
            const resourceIndex = prev.findIndex(resource => resource.id === updatedResource.id && resource.type === updatedResource.type);

            if (resourceIndex === -1) {
                return [...prev, updatedResource];
            }

            const nextResources = [...prev];
            nextResources[resourceIndex] = {
                ...nextResources[resourceIndex],
                ...updatedResource,
            };

            return nextResources;
        });
    };

    const reset = () => {
        setSupplier(null);
        setResources([]);
        setIsLoading(false);
        setError(null);
        setIsEditing(true);
    };

    return {
        supplier,
        resources,
        isLoading,
        isInitialLoading,
        error,
        isEditing,
        setIsEditing,
        loadExistingSupplier,
        saveSupplier,
        addResource,
        refreshResources,
        upsertResource,
        reset
    };
};
