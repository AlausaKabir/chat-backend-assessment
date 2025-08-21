import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { LoginDto, RegisterDto } from "../models/auth.dto";
import { UserRepository } from "../repositories/index";
import { config } from "../config/index";

const userRepository = new UserRepository();

export async function register(data: RegisterDto) {
  const { username, email, password } = data;

  // Business rule: Check if user already exists
  const existing = await userRepository.findByEmailOrUsername(email, username);
  if (existing) throw new Error("User already exists");

  // Business rule: Hash password for security
  const hashed = await bcrypt.hash(password, config.bcryptSaltRounds);

  // Create user through repository
  const user = await userRepository.create({
    username,
    email,
    password: hashed,
  });

  return user;
}

export async function login(data: LoginDto) {
  const { email, password } = data;

  // Business rule: Find user by email
  const user = await userRepository.findByEmail(email);
  if (!user) throw new Error("Invalid credentials");

  // Business rule: Validate password
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error("Invalid credentials");

  // Business rule: Generate JWT token
  const token = jwt.sign({ userId: user.id }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as any,
  });

  // Update last seen (business rule: track user activity)
  await userRepository.updateLastSeen(user.id);

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
    },
  };
}

export async function getUsers() {
  return userRepository.findAll();
}
