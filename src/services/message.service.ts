import { MessageRepository, RoomMemberRepository, UserRepository } from "../repositories/index.js";
import type { CreateMessageDto } from "../models/socket.dto.js";

const messageRepository = new MessageRepository();
const roomMemberRepository = new RoomMemberRepository();
const userRepository = new UserRepository();

export class MessageService {
  async createMessage(data: CreateMessageDto, senderId: number) {
    // Business rule: Validate user is member of the room
    const membership = await roomMemberRepository.findByUserAndRoom(senderId, data.roomId);
    if (!membership) {
      throw new Error("User is not a member of this room");
    }

    // Business rule: Validate message content
    if (!data.content || data.content.trim().length === 0) {
      throw new Error("Message content cannot be empty");
    }

    // Create message
    const message = await messageRepository.create({
      content: data.content.trim(),
      sender: { connect: { id: senderId } },
      room: { connect: { id: data.roomId } },
    });

    return message;
  }

  async getRoomMessages(roomId: number, userId: number, limit: number = 50) {
    // Business rule: Verify user has access to room
    const membership = await roomMemberRepository.findByUserAndRoom(userId, roomId);
    if (!membership) {
      throw new Error("Access denied to this room");
    }

    const messages = await messageRepository.findByRoom(roomId, limit);
    return messages.reverse(); // Return in chronological order
  }

  async validateRoomAccess(userId: number, roomId: number): Promise<boolean> {
    const membership = await roomMemberRepository.findByUserAndRoom(userId, roomId);
    return !!membership;
  }
}
