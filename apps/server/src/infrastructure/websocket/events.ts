// Socket.io Event Types
export const SocketEvents = {
  // Connection
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  AUTHENTICATE: 'authenticate',
  AUTHENTICATED: 'authenticated',

  // Match events
  JOIN_MATCH: 'join_match',
  LEAVE_MATCH: 'leave_match',
  JOINED_MATCH: 'joined_match',
  NEW_MATCH: 'new_match',
  MATCH_STATUS_UPDATED: 'match_status_updated',

  // Message events
  NEW_MESSAGE: 'new_message',
  MESSAGE_READ: 'message_read',
  TYPING_START: 'typing_start',
  TYPING_STOP: 'typing_stop',
  USER_TYPING: 'user_typing',
  USER_STOPPED_TYPING: 'user_stopped_typing',

  // Feed events (optional - for real-time updates)
  NEW_ITEM_AVAILABLE: 'new_item_available',
  ITEM_STATUS_CHANGED: 'item_status_changed'
} as const;

export type SocketEvent = typeof SocketEvents[keyof typeof SocketEvents];
