import express from "express";
import type { Application } from "express";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import authRoutes from "./routes/auth.routes.js";
import roomRoutes from "./routes/room.routes.js";
import { authenticate } from "./middlewares/auth.js";
import { setupSocketIO } from "./sockets/chat.socket.js";

// Load environment variables
dotenv.config();

const app: Application = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "*", // Configure this properly for production
    methods: ["GET", "POST"],
  },
});

const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/rooms", authenticate, roomRoutes);

// Health check route
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Setup Socket.IO
setupSocketIO(io);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  // Stylish server start message
  const cyan = "\x1b[36m";
  const green = "\x1b[32m";
  const reset = "\x1b[0m";
  const bold = "\x1b[1m";
  console.log(`\n${green}${bold}🚀 Chat Backend Server is up and running!${reset}`);
  console.log(`${cyan}${bold}→ HTTP Server: http://localhost:${PORT}${reset}`);
  console.log(`${cyan}${bold}→ Socket.IO Server: ws://localhost:${PORT}${reset}\n`);
});

export { app, server, io, prisma };
