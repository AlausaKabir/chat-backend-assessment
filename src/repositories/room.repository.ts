import { prisma } from "../index.js";
import type { Room, RoomMember, Prisma } from "@prisma/client";

export class RoomRepository {
  async findById(id: number): Promise<Room | null> {
    return prisma.room.findUnique({ where: { id } });
  }

  async create(data: Prisma.RoomCreateInput): Promise<Room> {
    return prisma.room.create({ data });
  }

  async createWithMember(roomData: Prisma.RoomCreateInput, userId: number): Promise<Room> {
    return prisma.room.create({
      data: {
        ...roomData,
        members: {
          create: { userId },
        },
      },
      include: { members: true },
    });
  }

  async findUserRooms(userId: number): Promise<Room[]> {
    const roomMembers = await prisma.roomMember.findMany({
      where: { userId },
      include: { room: true },
    });
    return roomMembers.map((rm) => rm.room);
  }

  async findRoomMembers(roomId: number): Promise<RoomMember[]> {
    return prisma.roomMember.findMany({
      where: { roomId },
      include: { user: { select: { id: true, username: true, email: true } } },
    });
  }
}
