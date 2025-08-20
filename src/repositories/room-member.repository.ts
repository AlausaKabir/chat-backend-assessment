import { prisma } from "../index.js";
import type { RoomMember, Prisma } from "@prisma/client";

export class RoomMemberRepository {
  async findByUserAndRoom(userId: number, roomId: number): Promise<RoomMember | null> {
    return prisma.roomMember.findFirst({
      where: { userId, roomId },
    });
  }

  async create(data: Prisma.RoomMemberCreateInput): Promise<RoomMember> {
    return prisma.roomMember.create({ data });
  }

  async upsert(userId: number, roomId: number): Promise<RoomMember> {
    return prisma.roomMember.upsert({
      where: {
        userId_roomId: { userId, roomId },
      },
      update: {},
      create: { userId, roomId },
    });
  }

  async removeUserFromRoom(userId: number, roomId: number): Promise<void> {
    await prisma.roomMember.deleteMany({
      where: { userId, roomId },
    });
  }
}
