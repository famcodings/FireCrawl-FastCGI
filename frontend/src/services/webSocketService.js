/** WebSocket service for real-time communication */
const WS_BASE_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8000';

class WebSocketService {
  constructor() {
    this.connection = null;
    this.messageHandlers = new Map();
  }

  /**
   * Connect to WebSocket for a specific request
   * @param {string} requestId - Request ID to connect to
   * @param {Object} callbacks - Callback functions for different message types
   */
  connect(requestId, callbacks = {}) {
    // Close existing connection
    this.disconnect();

    const wsUrl = `${WS_BASE_URL}/ws/${requestId}`;
    this.connection = new WebSocket(wsUrl);

    // Store callbacks
    this.messageHandlers.set('status', callbacks.onStatus);
    this.messageHandlers.set('result', callbacks.onResult);
    this.messageHandlers.set('error', callbacks.onError);

    this.connection.onopen = () => {
      // eslint-disable-next-line no-console
      console.log('✅ WebSocket connected to:', wsUrl);
      if (callbacks.onOpen) {
        callbacks.onOpen();
      }
    };

    this.connection.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // eslint-disable-next-line no-console
        console.log('📨 WebSocket message received:', data);
        const handler = this.messageHandlers.get(data.type);
        
        if (handler) {
          handler(data);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error parsing WebSocket message:', error);
        if (callbacks.onError) {
          callbacks.onError('Invalid message format');
        }
      }
    };

    this.connection.onclose = () => {
      // eslint-disable-next-line no-console
      console.log('WebSocket disconnected');
      if (callbacks.onClose) {
        callbacks.onClose();
      }
    };

    this.connection.onerror = (error) => {
      // eslint-disable-next-line no-console
      console.error('WebSocket error:', error);
      if (callbacks.onError) {
        callbacks.onError('WebSocket connection error');
      }
    };
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect() {
    if (this.connection) {
      this.connection.close();
      this.connection = null;
      this.messageHandlers.clear();
    }
  }

  /**
   * Check if WebSocket is connected
   * @returns {boolean} Connection status
   */
  isConnected() {
    return this.connection && this.connection.readyState === WebSocket.OPEN;
  }
}

export const webSocketService = new WebSocketService();
