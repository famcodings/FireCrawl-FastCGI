/** API service for backend communication */
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

class ApiService {
  /**
   * Start a new crawl request
   * @param {string} url - Website URL to analyze
   * @param {string} companyName - Company name
   * @returns {Promise<Object>} Response with request_id and status
   */
  async startCrawl(url, companyName) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/crawl`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          company_name: companyName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to start crawl');
      }

      return await response.json();
    } catch (error) {
      throw new Error(error.message || 'Network error');
    }
  }

  /**
   * Get the status of a crawl request
   * @param {string} requestId - Request ID
   * @returns {Promise<Object>} Request status and data
   */
  async getStatus(requestId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/status/${requestId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Request not found');
        }
        throw new Error('Failed to get status');
      }

      return await response.json();
    } catch (error) {
      throw new Error(error.message || 'Network error');
    }
  }

  /**
   * Get the single supplier for this PoC
   * @returns {Promise<any>} The supplier data
   */
  async getSupplier() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/supplier`);
      if (!response.ok) {
        if (response.status === 404) {
          return null; // No supplier exists yet
        }
        throw new Error('Failed to fetch supplier');
      }
      return await response.json();
    } catch (error) {
      throw new Error(error.message || 'Network error');
    }
  }

  /**
   * Creates or updates the single supplier for this PoC
   * @param {object} supplierData - The supplier data
   * @returns {Promise<any>} The created/updated supplier
   */
  async saveSupplier(supplierData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/supplier`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supplierData),
      });
      if (!response.ok) throw new Error('Failed to save supplier');
      return await response.json();
    } catch (error) {
      throw new Error(error.message || 'Network error');
    }
  }

  /**
   * Re-analyze a resource
   * @param {number} resourceId - ID of the resource to re-analyze
   * @param {string} resourceType - Type of resource ('URL' or 'PDF')
   * @returns {Promise<Object>} Success message
   */
  async reanalyzeResource(resourceId, resourceType) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/supplier/resources/${resourceId}/reanalyze?resource_type=${resourceType.toLowerCase()}`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to re-analyze resource');
      }
      return await response.json();
    } catch (error) {
      throw new Error(error.message || 'Network error');
    }
  }

  /**
   * Delete a resource
   * @param {number} resourceId - ID of the resource to delete
   * @param {string} resourceType - Type of resource ('URL' or 'PDF')
   * @returns {Promise<Object>} Success message
   */
  async deleteResource(resourceId, resourceType) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/supplier/resources/${resourceId}?resource_type=${resourceType.toLowerCase()}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete resource');
      }
      return await response.json();
    } catch (error) {
      throw new Error(error.message || 'Network error');
    }
  }

  /**
   * Get all resources for the single supplier
   * @returns {Promise<Array>} Array of resources
   */
  async getResources() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/supplier/resources`);
      if (!response.ok) {
        if (response.status === 404) {
          return []; // No supplier exists yet, return empty array
        }
        throw new Error('Failed to fetch resources');
      }
      return await response.json();
    } catch (error) {
      throw new Error(error.message || 'Network error');
    }
  }

  /**
   * Adds a resource for the single supplier
   * @param {FormData} resourceData - The resource data
   * @returns {Promise<any>} The created resource
   */
  async addResource(resourceData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/supplier/resources`, {
        method: 'POST',
        body: resourceData,
      });
      if (!response.ok) throw new Error('Failed to add resource');
      return await response.json();
    } catch (error) {
      throw new Error(error.message || 'Network error');
    }
  }
}

export const apiService = new ApiService();
