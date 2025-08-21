import { prisma } from "../index";
import type { User, Prisma } from "@prisma/client";

export class UserRepository {
  async create(data: Prisma.UserCreateInput): Promise<Omit<User, "password">> {
    return prisma.user.create({
      data,
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        lastSeen: true,
      },
    });
  }
  async findById(id: number): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async findByEmailOrUsername(email: string, username: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });
  }

  async findAll(): Promise<Omit<User, "password">[]> {
    return prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        lastSeen: true,
      },
    });
  }

  async updateLastSeen(id: number): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { lastSeen: new Date() },
    });
  }
}
