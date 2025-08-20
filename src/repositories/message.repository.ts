import { prisma } from "../index.js";
import type { Message, Prisma } from "@prisma/client";

export class MessageRepository {
  async create(data: Prisma.MessageCreateInput): Promise<Message> {
    return prisma.message.create({
      data,
      include: {
        sender: {
          select: { id: true, username: true, email: true },
        },
        room: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async findByRoom(roomId: number, limit: number = 50): Promise<Message[]> {
    return prisma.message.findMany({
      where: { roomId },
      include: {
        sender: {
          select: { id: true, username: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  async findById(id: number): Promise<Message | null> {
    return prisma.message.findUnique({
      where: { id },
      include: {
        sender: {
          select: { id: true, username: true, email: true },
        },
        room: {
          select: { id: true, name: true },
        },
      },
    });
  }
}
