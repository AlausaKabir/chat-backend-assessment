import { MessageRepository, RoomMemberRepository, UserRepository } from "../repositories/index.js";
import type { CreateMessageDto } from "../models/socket.dto.js";

const messageRepository = new MessageRepository();
const roomMemberRepository = new RoomMemberRepository();
const userRepository = new UserRepository();

export class MessageService {
  async createMessage(data: CreateMessageDto, senderId: number) {
    try {
      console.log("💬 Message Service - Creating message:");
      console.log("💬 Data received:", JSON.stringify(data));
      console.log("💬 Sender ID:", senderId);
      console.log("💬 Content:", data.content);
      console.log("💬 Content length:", data.content?.length);
      console.log("💬 Content trimmed:", data.content?.trim());
      console.log("💬 Content trimmed length:", data.content?.trim()?.length);

      // Business rule: Validate message content
      if (!data.content || data.content.trim().length === 0) {
        console.log("❌ Message validation failed - empty content");
        throw new Error("Message content cannot be empty");
      }

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
    } catch (error) {
      console.log("❌ Message Service - Error creating message:", error);
      throw error;
    }
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
