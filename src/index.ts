import express from "express";
import type { Application } from "express";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import authRoutes from "./routes/auth.routes";
import roomRoutes from "./routes/room.routes";
import { authenticate } from "./middlewares/auth";
import { setupSocketIO } from "./sockets/chat.socket";
import { config, validateConfig } from "./config/index";

// Validate configuration on startup
validateConfig();

const app: Application = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: config.allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const prisma = new PrismaClient();

// Middleware
app.use(
  cors({
    origin: config.allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/rooms", authenticate, roomRoutes);

// Health check route
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// Setup Socket.IO
setupSocketIO(io);

server.listen(config.port, () => {
  // Stylish server start message
  const cyan = "\x1b[36m";
  const green = "\x1b[32m";
  const reset = "\x1b[0m";
  const bold = "\x1b[1m";
  console.log(`\n${green}${bold}🚀 Chat Backend Server is up and running!${reset}`);
  console.log(`${cyan}${bold}→ HTTP Server: http://localhost:${config.port}${reset}`);
  console.log(`${cyan}${bold}→ Socket.IO Server: ws://localhost:${config.port}${reset}\n`);
});

export { app, server, io, prisma };
