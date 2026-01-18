import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../stores/authStore';
import { useChatStore } from '../stores/chatStore';
import type { Message } from '../types';

const WS_URL = process.env.EXPO_PUBLIC_WS_URL || 'http://localhost:3000';

class ChatSocketService {
  private socket: Socket | null = null;
  private isConnected = false;

  connect(): void {
    if (this.socket?.connected) {
      return;
    }

    const { user } = useAuthStore.getState();

    if (!user) {
      console.warn('Cannot connect socket: No user logged in');
      return;
    }

    this.socket = io(WS_URL, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.setupListeners();

    // Authenticate after connection
    this.socket.on('connect', () => {
      console.log('Socket connected, authenticating...');
      this.socket?.emit('authenticate', {
        userId: user.id,
        role: user.role
      });
      this.isConnected = true;
    });
  }

  private setupListeners(): void {
    if (!this.socket) return;

    // Authentication success
    this.socket.on('authenticated', (data: { userId: string; socketId: string }) => {
      console.log('Socket authenticated:', data);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.isConnected = false;
    });

    // Listen for new messages (backend event: new_message)
    this.socket.on('new_message', (message: Message) => {
      console.log('New message received:', message);
      if (message.matchId) {
        useChatStore.getState().addMessage(message.matchId, message);
      }
    });

    // Listen for typing indicators
    this.socket.on('user_typing', (data: { userId: string; matchId: string }) => {
      // Can be used to show typing indicator in UI
      console.log(`User ${data.userId} is typing in ${data.matchId}`);
    });

    this.socket.on('user_stopped_typing', (data: { userId: string; matchId: string }) => {
      console.log(`User ${data.userId} stopped typing in ${data.matchId}`);
    });

    // Listen for read receipts
    this.socket.on('message_read', (data: { messageId: string; userId: string }) => {
      console.log(`Message ${data.messageId} read by ${data.userId}`);
    });

    // Listen for match notifications
    this.socket.on('new_match', (match: any) => {
      console.log('New match received:', match);
      // Could trigger a notification or update match store
    });

    // Listen for match status updates
    this.socket.on('match_status_updated', (data: { status: string; match: any }) => {
      console.log('Match status updated:', data);
    });

    // Listen for joined match room confirmation
    this.socket.on('joined_match', (data: { matchId: string }) => {
      console.log('Joined match room:', data.matchId);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  joinMatch(matchId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('join_match', matchId);
    }
  }

  leaveMatch(matchId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('leave_match', matchId);
    }
  }

  sendMessage(matchId: string, content: string): void {
    // NOTE: We'll use HTTP API for sending messages, not socket
    // Socket will just receive new_message events
    console.warn('Use api.sendMessage() instead of socket for sending messages');
  }

  sendTypingStart(matchId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('typing_start', { matchId });
    }
  }

  sendTypingStop(matchId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('typing_stop', { matchId });
    }
  }

  markAsRead(messageId: string): void {
    // NOTE: Use HTTP API for marking as read
    console.warn('Use api.markMessageAsRead() instead');
  }

  // Check if socket is connected
  getConnectionStatus(): boolean {
    return this.isConnected && (this.socket?.connected ?? false);
  }

  // Reconnect with new token (after login)
  reconnectWithToken(): void {
    this.disconnect();
    this.connect();
  }
}

// Export singleton instance
export const chatSocket = new ChatSocketService();

// Hook for using socket in components
export const useSocket = () => {
  return {
    connect: () => chatSocket.connect(),
    disconnect: () => chatSocket.disconnect(),
    joinMatch: (matchId: string) => chatSocket.joinMatch(matchId),
    leaveMatch: (matchId: string) => chatSocket.leaveMatch(matchId),
    sendTypingStart: (matchId: string) => chatSocket.sendTypingStart(matchId),
    sendTypingStop: (matchId: string) => chatSocket.sendTypingStop(matchId),
    isConnected: () => chatSocket.getConnectionStatus(),
  };
};
