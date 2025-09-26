/** WebSocket service for real-time communication */
const WS_BASE_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8000';

class WebSocketService {
  constructor() {
    this.connections = new Map(); // Map of requestId -> {connection, handlers}
  }

  /**
   * Connect to WebSocket for a specific request
   * @param {string} requestId - Request ID to connect to
   * @param {Object} callbacks - Callback functions for different message types
   */
  connect(requestId, callbacks = {}) {
    // Close existing connection for this specific requestId
    this.disconnect(requestId);

    const wsUrl = `${WS_BASE_URL}/api/ws/${requestId}`;
    const connection = new WebSocket(wsUrl);

    // Store callbacks
    const messageHandlers = new Map();
    messageHandlers.set('status', callbacks.onStatus);
    messageHandlers.set('result', callbacks.onResult);
    messageHandlers.set('error', callbacks.onError);

    // Store connection and handlers
    this.connections.set(requestId, {
      connection,
      handlers: messageHandlers,
      callbacks
    });

    connection.onopen = () => {
      // eslint-disable-next-line no-console
      console.log('✅ WebSocket connected to:', wsUrl);
      if (callbacks.onOpen) {
        callbacks.onOpen();
      }
    };

    connection.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // eslint-disable-next-line no-console
        console.log('📨 WebSocket message received:', data);
        const handler = messageHandlers.get(data.type);
        
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

    connection.onclose = () => {
      // eslint-disable-next-line no-console
      console.log('WebSocket disconnected for requestId:', requestId);
      this.connections.delete(requestId);
      if (callbacks.onClose) {
        callbacks.onClose();
      }
    };

    connection.onerror = (error) => {
      // eslint-disable-next-line no-console
      console.error('WebSocket error for requestId:', requestId, error);
      if (callbacks.onError) {
        callbacks.onError('WebSocket connection error');
      }
    };
  }

  /**
   * Disconnect from WebSocket for a specific requestId, or all connections
   * @param {string} requestId - Optional requestId to disconnect specific connection
   */
  disconnect(requestId = null) {
    if (requestId) {
      // Disconnect specific connection
      const connectionData = this.connections.get(requestId);
      if (connectionData) {
        connectionData.connection.close();
        this.connections.delete(requestId);
      }
    } else {
      // Disconnect all connections
      this.connections.forEach((connectionData) => {
        connectionData.connection.close();
      });
      this.connections.clear();
    }
  }

  /**
   * Check if WebSocket is connected for a specific requestId, or any connection
   * @param {string} requestId - Optional requestId to check specific connection
   * @returns {boolean} Connection status
   */
  isConnected(requestId = null) {
    if (requestId) {
      const connectionData = this.connections.get(requestId);
      return connectionData && connectionData.connection.readyState === WebSocket.OPEN;
    } else {
      // Check if any connection is open
      return Array.from(this.connections.values()).some(
        connectionData => connectionData.connection.readyState === WebSocket.OPEN
      );
    }
  }
}

export const webSocketService = new WebSocketService();
