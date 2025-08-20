import { Server as SocketIOServer, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { MessageService } from "../services/message.service.js";
import { UserRepository } from "../repositories/index.js";
import type { SendMessageSocketDto, JoinRoomSocketDto, TypingDto } from "../models/socket.dto.js";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
const messageService = new MessageService();
const userRepository = new UserRepository();

// Store active users and their rooms
const activeUsers = new Map<string, { userId: number; username: string; rooms: Set<number> }>();

export function setupSocketIO(io: SocketIOServer) {
  // Socket.IO Authentication Middleware
  io.use(async (socket: Socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication token required"));
      }

      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
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
    console.log(`${user.username} connected (${socket.id})`);

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
    socket.on("send_message", async (data: SendMessageSocketDto) => {
      try {
        const { roomId, content } = data;

        // Create message
        const message = await messageService.createMessage({ content, roomId }, user.id);

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
      } catch (error: any) {
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
