import { create } from 'zustand';
import type { Message, Conversation } from '../types';

// 🎭 DEMO MODE - NO SOCKET, NO API - Sve fake!
interface ChatState {
  conversations: Conversation[];
  messages: { [matchId: string]: Message[] };
  activeMatchId: string | null;
  isLoading: boolean;
  isSending: boolean;
  error: string | null;

  // Actions
  fetchConversations: () => Promise<void>;
  fetchMessages: (matchId: string) => Promise<void>;
  sendMessage: (matchId: string, content: string) => Promise<boolean>;

  // Real-time actions (FAKE)
  addMessage: (matchId: string, message: Message) => void;
  setActiveMatch: (matchId: string | null) => void;
  markAsRead: (matchId: string) => void;

  // Optimistic UI
  addOptimisticMessage: (matchId: string, content: string, tempId: string) => void;
  confirmMessage: (matchId: string, tempId: string, confirmedMessage: Message) => void;
  removeFailedMessage: (matchId: string, tempId: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  messages: {},
  activeMatchId: null,
  isLoading: false,
  isSending: false,
  error: null,

  // 🎭 FAKE - Samo simulacija
  fetchConversations: async () => {
    console.log('[CHAT] 🎭 DEMO MODE - No real conversations');
    set({ isLoading: true, error: null });
    await new Promise(resolve => setTimeout(resolve, 300));
    set({ conversations: [], isLoading: false });
  },

  // 🎭 FAKE - Samo simulacija
  fetchMessages: async (matchId: string) => {
    console.log('[CHAT] 🎭 DEMO MODE - No real messages');
    set({ isLoading: true, error: null });
    await new Promise(resolve => setTimeout(resolve, 300));
    set((state) => ({
      messages: { ...state.messages, [matchId]: [] },
      isLoading: false,
    }));
  },

  // 🎭 FAKE - Samo simulacija
  sendMessage: async (matchId: string, content: string) => {
    console.log('[CHAT] 🎭 DEMO MODE - Fake message sent');
    const tempId = `temp-${Date.now()}`;
    get().addOptimisticMessage(matchId, content, tempId);
    set({ isSending: true });
    await new Promise(resolve => setTimeout(resolve, 400));

    const fakeMessage: Message = {
      id: `msg-${Date.now()}`,
      matchId,
      senderId: 'me',
      content,
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    get().confirmMessage(matchId, tempId, fakeMessage);
    set({ isSending: false });
    return true;
  },

  addMessage: (matchId: string, message: Message) => {
    set((state) => {
      const currentMessages = state.messages[matchId] || [];
      if (currentMessages.some((m) => m.id === message.id)) {
        return state;
      }
      return {
        messages: {
          ...state.messages,
          [matchId]: [...currentMessages, message],
        },
      };
    });
  },

  // 🎭 FAKE - No socket calls
  setActiveMatch: (matchId: string | null) => {
    console.log('[CHAT] 🎭 DEMO MODE - Active match set (no socket)');
    set({ activeMatchId: matchId });
  },

  markAsRead: (matchId: string) => {
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.matchId === matchId ? { ...conv, unreadCount: 0 } : conv
      ),
    }));
  },

  addOptimisticMessage: (matchId: string, content: string, tempId: string) => {
    const optimisticMessage: Message = {
      id: tempId,
      matchId,
      senderId: 'me',
      content,
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    set((state) => ({
      messages: {
        ...state.messages,
        [matchId]: [...(state.messages[matchId] || []), optimisticMessage],
      },
    }));
  },

  confirmMessage: (matchId: string, tempId: string, confirmedMessage: Message) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [matchId]: (state.messages[matchId] || []).map((msg) =>
          msg.id === tempId ? confirmedMessage : msg
        ),
      },
    }));
  },

  removeFailedMessage: (matchId: string, tempId: string) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [matchId]: (state.messages[matchId] || []).filter((msg) => msg.id !== tempId),
      },
    }));
  },
}));
