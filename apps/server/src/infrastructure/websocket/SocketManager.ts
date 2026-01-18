import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';

export interface SocketUser {
  userId: string;
  socketId: string;
  role: 'provider' | 'seeker';
}

class SocketManager {
  private static instance: SocketManager;
  private io: SocketIOServer | null = null;
  private userSockets: Map<string, string> = new Map(); // userId -> socketId
  private socketUsers: Map<string, SocketUser> = new Map(); // socketId -> user info

  private constructor() {}

  static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  initialize(server: HttpServer): void {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: '*', // For development - restrict in production
        methods: ['GET', 'POST']
      },
      path: '/socket.io'
    });

    this.setupEventHandlers();
    console.log('✅ Socket.io initialized');
  }

  private setupEventHandlers(): void {
    if (!this.io) return;

    this.io.on('connection', (socket: Socket) => {
      console.log(`🔌 Client connected: ${socket.id}`);

      // Handle authentication
      socket.on('authenticate', (data: { userId: string; role: 'provider' | 'seeker' }) => {
        const { userId, role } = data;

        // Remove old socket for this user if exists
        const oldSocketId = this.userSockets.get(userId);
        if (oldSocketId) {
          this.socketUsers.delete(oldSocketId);
        }

        // Register new socket
        this.userSockets.set(userId, socket.id);
        this.socketUsers.set(socket.id, { userId, socketId: socket.id, role });

        // Join user's personal room
        socket.join(`user:${userId}`);

        console.log(`✅ User authenticated: ${userId} (${role}) -> ${socket.id}`);
        socket.emit('authenticated', { userId, socketId: socket.id });
      });

      // Handle joining match room for chat
      socket.on('join_match', (matchId: string) => {
        socket.join(`match:${matchId}`);
        console.log(`👥 Socket ${socket.id} joined match: ${matchId}`);
        socket.emit('joined_match', { matchId });
      });

      // Handle leaving match room
      socket.on('leave_match', (matchId: string) => {
        socket.leave(`match:${matchId}`);
        console.log(`👋 Socket ${socket.id} left match: ${matchId}`);
      });

      // Handle typing indicator
      socket.on('typing_start', (data: { matchId: string }) => {
        const user = this.socketUsers.get(socket.id);
        if (user) {
          socket.to(`match:${data.matchId}`).emit('user_typing', {
            userId: user.userId,
            matchId: data.matchId
          });
        }
      });

      socket.on('typing_stop', (data: { matchId: string }) => {
        const user = this.socketUsers.get(socket.id);
        if (user) {
          socket.to(`match:${data.matchId}`).emit('user_stopped_typing', {
            userId: user.userId,
            matchId: data.matchId
          });
        }
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        const user = this.socketUsers.get(socket.id);
        if (user) {
          this.userSockets.delete(user.userId);
          this.socketUsers.delete(socket.id);
          console.log(`❌ User disconnected: ${user.userId} (${socket.id})`);
        } else {
          console.log(`❌ Client disconnected: ${socket.id}`);
        }
      });
    });
  }

  // Emit new message to match room
  emitNewMessage(matchId: string, message: any): void {
    if (!this.io) return;
    this.io.to(`match:${matchId}`).emit('new_message', message);
  }

  // Emit new match notification to user
  emitNewMatch(userId: string, match: any): void {
    if (!this.io) return;
    this.io.to(`user:${userId}`).emit('new_match', match);
  }

  // Emit match status update (accepted/rejected)
  emitMatchStatusUpdate(matchId: string, status: string, match: any): void {
    if (!this.io) return;
    this.io.to(`match:${matchId}`).emit('match_status_updated', { status, match });
  }

  // Notify user about message read status
  emitMessageRead(matchId: string, messageId: string, userId: string): void {
    if (!this.io) return;
    this.io.to(`match:${matchId}`).emit('message_read', { messageId, userId });
  }

  // Check if user is online
  isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId);
  }

  // Get online users count
  getOnlineUsersCount(): number {
    return this.userSockets.size;
  }

  // Get socket ID for user
  getUserSocketId(userId: string): string | undefined {
    return this.userSockets.get(userId);
  }
}

export const socketManager = SocketManager.getInstance();
