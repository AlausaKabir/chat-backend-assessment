import { Server as SocketIOServer, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { MessageService } from "../services/message.service";
import { UserRepository } from "../repositories/index";
import { messageRateLimiter } from "../services/rate-limiter.service";
import type { SendMessageSocketDto, JoinRoomSocketDto, TypingDto } from "../models/socket.dto";
import { config } from "../config/index";

const messageService = new MessageService();
const userRepository = new UserRepository();

// Store active users and their rooms
const activeUsers = new Map<string, { userId: number; username: string; rooms: Set<number> }>();

export function setupSocketIO(io: SocketIOServer) {
  // Socket.IO Authentication Middleware
  io.use(async (socket: Socket, next) => {
    try {
      // Try to get token from auth object first, then from query parameters
      const token = socket.handshake.auth.token || socket.handshake.query.token;

      if (!token) {
        return next(new Error("Authentication token required"));
      }

      const decoded = jwt.verify(token as string, config.jwtSecret) as { userId: number };
      const user = await userRepository.findById(decoded.userId);

      if (!user) {
        return next(new Error("Invalid token"));
      }

      // Attach user to socket
      socket.data.user = { id: user.id, username: user.username, email: user.email };
      next();
    } catch (error) {
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const user = socket.data.user;

    // Store active user
    activeUsers.set(socket.id, {
      userId: user.id,
      username: user.username,
      rooms: new Set(),
    });

    // Update user's last seen
    userRepository.updateLastSeen(user.id);

    // Handle joining a room
    socket.on("join_room", async (data: JoinRoomSocketDto) => {
      try {
        const { roomId } = data;

        // Validate room access
        const hasAccess = await messageService.validateRoomAccess(user.id, roomId);
        if (!hasAccess) {
          socket.emit("error", { message: "Access denied to this room" });
          return;
        }

        // Join the socket room
        socket.join(`room_${roomId}`);

        // Track user's rooms
        const activeUser = activeUsers.get(socket.id);
        if (activeUser) {
          activeUser.rooms.add(roomId);
        }

        // Notify room about user joining
        socket.to(`room_${roomId}`).emit("user_joined", {
          userId: user.id,
          username: user.username,
          timestamp: new Date().toISOString(),
        });

        // Send recent messages to user
        const messages = await messageService.getRoomMessages(roomId, user.id, 20);
        socket.emit("room_messages", { roomId, messages });

        socket.emit("room_joined", { roomId, message: "Successfully joined room" });
      } catch (error: any) {
        socket.emit("error", { message: error.message });
      }
    });

    // Handle sending messages
    socket.on("message", async (data: SendMessageSocketDto) => {
      try {
        const { roomId, content } = data;

        // Rate limiting check
        if (!messageRateLimiter.canSendMessage(user.id)) {
          const resetTime = messageRateLimiter.getResetTime(user.id);
          const waitTime = Math.ceil((resetTime - Date.now()) / 1000);

          socket.emit("error", {
            message: `Rate limit exceeded. You can send ${
              config.messageLimitPerWindow
            } messages per ${
              config.messageLimitWindowMs / 1000
            } seconds. Try again in ${waitTime} seconds.`,
            type: "RATE_LIMIT_EXCEEDED",
            resetTime,
            waitTime,
          });
          return;
        }

        // Create message
        const message = await messageService.createMessage({ content, roomId }, user.id);

        if (!message) {
          throw new Error("Failed to create message");
        }

        // Broadcast to room (including sender)
        io.to(`room_${roomId}`).emit("receive_message", {
          id: message.id,
          content: message.content,
          sender: {
            id: user.id,
            username: user.username,
          },
          roomId,
          createdAt: message.createdAt,
          timestamp: new Date().toISOString(),
        });

        // Send rate limit info to user
        const remaining = messageRateLimiter.getRemainingMessages(user.id);
        if (remaining <= 2) {
          socket.emit("rate_limit_warning", {
            remaining,
            resetTime: messageRateLimiter.getResetTime(user.id),
          });
        }
      } catch (error: any) {
        console.log("❌ Error stack:", error.stack);
        socket.emit("error", { message: error.message });
      }
    });

    // Handle typing indicators
    socket.on("typing", (data: TypingDto) => {
      const { roomId, isTyping } = data;
      socket.to(`room_${roomId}`).emit("user_typing", {
        userId: user.id,
        username: user.username,
        isTyping,
        timestamp: new Date().toISOString(),
      });
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`${user.username} disconnected (${socket.id})`);

      const activeUser = activeUsers.get(socket.id);
      if (activeUser) {
        // Notify all rooms about user going offline
        activeUser.rooms.forEach((roomId) => {
          socket.to(`room_${roomId}`).emit("user_status", {
            userId: user.id,
            username: user.username,
            status: "offline",
            timestamp: new Date().toISOString(),
          });
        });
      }

      // Update last seen and remove from active users
      userRepository.updateLastSeen(user.id);
      activeUsers.delete(socket.id);
    });

    // Broadcast user online status to their rooms
    socket.emit("user_status", {
      userId: user.id,
      username: user.username,
      status: "online",
      timestamp: new Date().toISOString(),
    });
  });
}
