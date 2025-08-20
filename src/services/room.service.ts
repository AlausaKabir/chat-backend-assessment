import type { CreateRoomDto, JoinRoomDto } from "../models/room.dto.js";
import { nanoid } from "nanoid";
import { RoomRepository, RoomMemberRepository } from "../repositories/index.js";

const roomRepository = new RoomRepository();
const roomMemberRepository = new RoomMemberRepository();

export async function createRoom(data: CreateRoomDto, userId: number) {
  const { name, isPrivate } = data;

  // Business rule: Generate invite code for private rooms
  const inviteCode = isPrivate ? nanoid(10) : null;

  // Create room with creator as first member
  const room = await roomRepository.createWithMember(
    {
      name,
      isPrivate,
      inviteCode,
    },
    userId
  );

  return room;
}

export async function joinRoom(data: JoinRoomDto, userId: number) {
  const { roomId, inviteCode } = data;

  // Business rule: Check if room exists
  const room = await roomRepository.findById(roomId);
  if (!room) throw new Error("Room not found");

  // Business rule: Validate invite code for private rooms
  if (room.isPrivate && room.inviteCode !== inviteCode) {
    throw new Error("Invalid invite code");
  }

  // Business rule: Check if user is already a member
  const existingMembership = await roomMemberRepository.findByUserAndRoom(userId, roomId);
  if (existingMembership) {
    return { message: "Already a member of this room" };
  }

  // Add user to room
  await roomMemberRepository.upsert(userId, roomId);

  return { message: "Joined room successfully" };
}

export async function listRooms(userId: number) {
  // Get all rooms user is a member of
  return await roomRepository.findUserRooms(userId);
}
