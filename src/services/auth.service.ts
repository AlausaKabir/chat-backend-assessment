import { prisma } from "../index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { LoginDto, RegisterDto } from "../models/auth.dto.js";


const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export async function register(data: RegisterDto) {
  const { username, email, password } = data;
  const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
  if (existing) throw new Error("User already exists");
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { username, email, password: hashed },
    select: { id: true, username: true, email: true, createdAt: true },
  });
  return user;
}

export async function login(data: LoginDto) {
  const { email, password } = data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Invalid credentials");
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error("Invalid credentials");
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
  return { token, user: { id: user.id, username: user.username, email: user.email } };
}
