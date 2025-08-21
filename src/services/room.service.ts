import type { CreateRoomDto, JoinRoomDto } from "../models/room.dto";
import { nanoid } from "nanoid";
import { RoomRepository, RoomMemberRepository } from "../repositories/index";
import { config } from "../config/index";

const roomRepository = new RoomRepository();
const roomMemberRepository = new RoomMemberRepository();

export async function createRoom(data: CreateRoomDto, userId: number) {
  const { name, isPrivate = false } = data;

  // Business rule: Generate invite code for all rooms (for easy joining)
  const inviteCode = nanoid(config.inviteCodeLength);

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
  const { inviteCode } = data;

  // Business rule: Check if room exists by invite code
  const room = await roomRepository.findByInviteCode(inviteCode);
  if (!room) throw new Error("Invalid invite code or room not found");

  // Business rule: Check if user is already a member
  const existingMembership = await roomMemberRepository.findByUserAndRoom(userId, room.id);
  if (existingMembership) {
    return { message: "Already a member of this room", room };
  }

  // Add user to room
  await roomMemberRepository.upsert(userId, room.id);

  return { message: "Joined room successfully", room };
}

export async function listRooms(userId: number) {
  // Get all rooms user is a member of
  return await roomRepository.findUserRooms(userId);
}
