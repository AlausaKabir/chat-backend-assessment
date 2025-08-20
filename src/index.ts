import express from "express";
import type { Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import authRoutes from "./routes/auth.routes.js";
import roomRoutes from "./routes/room.routes.js";
import { authenticate } from "./middlewares/auth.js";

// Load environment variables
dotenv.config();

const app: Application = express();
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

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  // Stylish server start message
  const cyan = "\x1b[36m";
  const green = "\x1b[32m";
  const reset = "\x1b[0m";
  const bold = "\x1b[1m";
  console.log(`\n${green}${bold}🚀 Chat Backend Server is up and running!${reset}`);
  console.log(`${cyan}${bold}→ Listening at: http://localhost:${PORT}${reset}\n`);
});

export { app, prisma };
