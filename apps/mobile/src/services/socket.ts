// 🎭 DEMO MODE - FAKE SOCKET SERVICE - NO REAL CONNECTIONS!

// Dummy types to keep TypeScript happy
class ChatSocketService {
  private isConnected = false;

  // 🎭 FAKE - Ne connectuje se uopšte
  connect(): void {
    console.log('[SOCKET] 🎭 DEMO MODE - Fake socket connect (no real connection)');
    this.isConnected = false; // Uvek false, ne connectujemo se
  }

  // 🎭 FAKE - Ništa ne radi
  disconnect(): void {
    console.log('[SOCKET] 🎭 DEMO MODE - Fake socket disconnect');
    this.isConnected = false;
  }

  // 🎭 FAKE - Ništa ne radi
  joinMatch(matchId: string): void {
    console.log('[SOCKET] 🎭 DEMO MODE - Fake join match:', matchId);
  }

  // 🎭 FAKE - Ništa ne radi
  leaveMatch(matchId: string): void {
    console.log('[SOCKET] 🎭 DEMO MODE - Fake leave match:', matchId);
  }

  // 🎭 FAKE - Ništa ne radi
  sendMessage(matchId: string, content: string): void {
    console.log('[SOCKET] 🎭 DEMO MODE - Fake send message');
  }

  // 🎭 FAKE - Ništa ne radi
  sendTypingStart(matchId: string): void {
    console.log('[SOCKET] 🎭 DEMO MODE - Fake typing start');
  }

  // 🎭 FAKE - Ništa ne radi
  sendTypingStop(matchId: string): void {
    console.log('[SOCKET] 🎭 DEMO MODE - Fake typing stop');
  }

  // 🎭 FAKE - Ništa ne radi
  markAsRead(messageId: string): void {
    console.log('[SOCKET] 🎭 DEMO MODE - Fake mark as read');
  }

  // 🎭 FAKE - Uvek false, nikad connectovan
  getConnectionStatus(): boolean {
    return false;
  }

  // 🎭 FAKE - Ništa ne radi
  reconnectWithToken(): void {
    console.log('[SOCKET] 🎭 DEMO MODE - Fake reconnect');
  }
}

// Export singleton instance (FAKE)
export const chatSocket = new ChatSocketService();

// Hook for using socket in components (FAKE)
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
