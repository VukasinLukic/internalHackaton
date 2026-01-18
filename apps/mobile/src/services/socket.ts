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

    const token = useAuthStore.getState().token;

    this.socket = io(WS_URL, {
      auth: {
        token,
      },
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.setupListeners();
  }

  private setupListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.isConnected = true;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.isConnected = false;
    });

    // Listen for new messages
    this.socket.on('new_message', (data: { matchId: string; message: Message }) => {
      const { matchId, message } = data;
      useChatStore.getState().addMessage(matchId, message);
    });

    // Listen for typing indicators
    this.socket.on('user_typing', (data: { matchId: string; userId: string }) => {
      // Can be used to show typing indicator in UI
      console.log(`User ${data.userId} is typing in ${data.matchId}`);
    });

    // Listen for read receipts
    this.socket.on('messages_read', (data: { matchId: string; userId: string }) => {
      console.log(`Messages read by ${data.userId} in ${data.matchId}`);
    });

    // Listen for match notifications
    this.socket.on('new_match', (data: { match: any }) => {
      console.log('New match received:', data.match);
      // Could trigger a notification or update match store
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  joinRoom(matchId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('join_room', { matchId });
    }
  }

  leaveRoom(matchId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('leave_room', { matchId });
    }
  }

  sendMessage(matchId: string, content: string): void {
    if (this.socket?.connected) {
      this.socket.emit('send_message', {
        matchId,
        content,
      });
    }
  }

  sendTyping(matchId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('typing', { matchId });
    }
  }

  markAsRead(matchId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('mark_read', { matchId });
    }
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
    joinRoom: (matchId: string) => chatSocket.joinRoom(matchId),
    leaveRoom: (matchId: string) => chatSocket.leaveRoom(matchId),
    sendMessage: (matchId: string, content: string) =>
      chatSocket.sendMessage(matchId, content),
    sendTyping: (matchId: string) => chatSocket.sendTyping(matchId),
    markAsRead: (matchId: string) => chatSocket.markAsRead(matchId),
    isConnected: () => chatSocket.getConnectionStatus(),
  };
};
