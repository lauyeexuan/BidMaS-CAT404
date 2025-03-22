// WebSocket service for real-time communication
let socket = null;
let messageListeners = {};

const websocketService = {
  // Initialize WebSocket connection
  connect: () => {
    return new Promise((resolve, reject) => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        resolve(socket);
        return;
      }

      // Create new WebSocket connection
      socket = new WebSocket('ws://localhost:4000');

      // Connection opened
      socket.addEventListener('open', (event) => {
        console.log('WebSocket connected');
        resolve(socket);
      });

      // Listen for messages
      socket.addEventListener('message', (event) => {
        try {
          const message = JSON.parse(event.data);
          // Dispatch to all registered listeners for this message type
          if (messageListeners[message.type]) {
            messageListeners[message.type].forEach(callback => callback(message.data));
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      });

      // Handle errors
      socket.addEventListener('error', (event) => {
        console.error('WebSocket error:', event);
        reject(event);
      });

      // Handle connection close
      socket.addEventListener('close', (event) => {
        console.log('WebSocket disconnected, code:', event.code, 'reason:', event.reason);
        
        // Attempt to reconnect after a delay if not closed intentionally
        if (event.code !== 1000) {
          console.log('Attempting to reconnect in 3 seconds...');
          setTimeout(() => websocketService.connect(), 3000);
        }
      });
    });
  },

  // Disconnect WebSocket
  disconnect: () => {
    if (socket) {
      socket.close(1000, 'User disconnected');
      socket = null;
    }
  },

  // Register listener for specific message types
  on: (type, callback) => {
    if (!messageListeners[type]) {
      messageListeners[type] = [];
    }
    messageListeners[type].push(callback);
    
    // Return a function to unregister this specific listener
    return () => {
      if (messageListeners[type]) {
        messageListeners[type] = messageListeners[type].filter(cb => cb !== callback);
      }
    };
  },

  // Send a message to the server
  send: (type, data) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type, data }));
    } else {
      console.error('WebSocket not connected, message not sent');
    }
  },

  // Get connection status
  isConnected: () => {
    return socket && socket.readyState === WebSocket.OPEN;
  }
};

export default websocketService; 