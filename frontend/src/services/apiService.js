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

}

export const apiService = new ApiService();
