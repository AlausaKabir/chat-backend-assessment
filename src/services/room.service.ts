import { prisma } from "../index.js";
import type { CreateRoomDto, JoinRoomDto } from "../models/room.dto.js";
import { nanoid } from "nanoid";

export async function createRoom(data: CreateRoomDto, userId: number) {
  const { name, isPrivate } = data;
  const inviteCode = isPrivate ? nanoid(10) : null;
  const room = await prisma.room.create({
    data: {
      name,
      isPrivate,
      inviteCode,
      members: { create: { userId } },
    },
    include: { members: true },
  });
  return room;
}

export async function joinRoom(data: JoinRoomDto, userId: number) {
  const { roomId, inviteCode } = data;
  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room) throw new Error("Room not found");
  if (room.isPrivate && room.inviteCode !== inviteCode) throw new Error("Invalid invite code");
  await prisma.roomMember.upsert({
    where: { userId_roomId: { userId, roomId } },
    update: {},
    create: { userId, roomId },
  });
  return { message: "Joined room successfully" };
}

export async function listRooms(userId: number) {
  const rooms = await prisma.roomMember.findMany({
    where: { userId },
    include: { room: true },
  });
  return rooms.map((rm) => rm.room);
}
