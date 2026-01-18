import { create } from 'zustand';
import type { Message, Conversation } from '../types';
import { api } from '../services/api';
import { chatSocket } from '../services/socket';

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

  // Real-time actions (for Socket.io)
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

  fetchConversations: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.getConversations();

      if (response.success && response.data) {
        set({
          conversations: response.data.conversations || [],
          isLoading: false,
        });
      } else {
        set({
          error: response.error || 'Failed to fetch conversations',
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        error: 'Network error. Please check your connection.',
        isLoading: false,
      });
    }
  },

  fetchMessages: async (matchId: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.getMessages(matchId);

      if (response.success && response.data) {
        set((state) => ({
          messages: {
            ...state.messages,
            [matchId]: response.data.messages || [],
          },
          isLoading: false,
        }));

        // Join socket room for real-time updates
        chatSocket.joinRoom(matchId);
      } else {
        set({
          error: response.error || 'Failed to fetch messages',
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        error: 'Network error. Please check your connection.',
        isLoading: false,
      });
    }
  },

  sendMessage: async (matchId: string, content: string) => {
    const tempId = `temp-${Date.now()}`;

    // Optimistic update
    get().addOptimisticMessage(matchId, content, tempId);
    set({ isSending: true });

    try {
      const response = await api.sendMessage(matchId, content);

      if (response.success && response.data) {
        // Replace optimistic message with confirmed one
        get().confirmMessage(matchId, tempId, response.data.message);
        set({ isSending: false });
        return true;
      } else {
        // Remove failed message
        get().removeFailedMessage(matchId, tempId);
        set({ isSending: false });
        return false;
      }
    } catch (error) {
      get().removeFailedMessage(matchId, tempId);
      set({ isSending: false });
      return false;
    }
  },

  addMessage: (matchId: string, message: Message) => {
    set((state) => {
      const currentMessages = state.messages[matchId] || [];

      // Avoid duplicates
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

    // Update conversation's last message
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.matchId === matchId
          ? { ...conv, lastMessage: message, unreadCount: conv.unreadCount + 1 }
          : conv
      ),
    }));
  },

  setActiveMatch: (matchId: string | null) => {
    const previousMatchId = get().activeMatchId;

    // Leave previous room
    if (previousMatchId) {
      chatSocket.leaveRoom(previousMatchId);
    }

    // Join new room
    if (matchId) {
      chatSocket.joinRoom(matchId);
      get().markAsRead(matchId);
    }

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
      senderId: 'me', // Will be replaced with actual user ID
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
