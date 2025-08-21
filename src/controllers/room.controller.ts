import type { Response } from "express";
import * as RoomService from "../services/room.service";
import { MessageService } from "../services/message.service";
import type { AuthenticatedRequest } from "../middlewares/auth";
import { ResponseUtil } from "../utils/response.util";

const messageService = new MessageService();

export const createRoom = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(ResponseUtil.unauthorized("User not authenticated"));
    }
    const room = await RoomService.createRoom(req.body, req.user.id);
    res.status(201).json(ResponseUtil.created("Room created successfully", room));
  } catch (error: any) {
    res.status(400).json(ResponseUtil.badRequest("Failed to create room", error.message));
  }
};

export const joinRoom = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(ResponseUtil.unauthorized("User not authenticated"));
    }
    const result = await RoomService.joinRoom(req.body, req.user.id);
    res.status(200).json(ResponseUtil.success("Successfully joined room", result));
  } catch (error: any) {
    res.status(400).json(ResponseUtil.badRequest("Failed to join room", error.message));
  }
};

export const listRooms = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(ResponseUtil.unauthorized("User not authenticated"));
    }
    const rooms = await RoomService.listRooms(req.user.id);
    res.status(200).json(ResponseUtil.success("Rooms retrieved successfully", rooms));
  } catch (error: any) {
    res.status(400).json(ResponseUtil.badRequest("Failed to retrieve rooms", error.message));
  }
};

export const getRoomMessages = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(ResponseUtil.unauthorized("User not authenticated"));
    }

    const roomId = parseInt(req.params.roomId!);
    const limit = parseInt(req.query.limit as string) || 50;

    if (isNaN(roomId)) {
      return res.status(400).json(ResponseUtil.badRequest("Invalid room ID"));
    }

    // Check if user has access to this room
    const hasAccess = await messageService.validateRoomAccess(req.user.id, roomId);
    if (!hasAccess) {
      return res.status(403).json(ResponseUtil.badRequest("Access denied to this room"));
    }

    const messages = await messageService.getRoomMessages(roomId, req.user.id, limit);
    res.status(200).json(
      ResponseUtil.success("Messages retrieved successfully", {
        roomId,
        messages,
        count: messages.length,
      })
    );
  } catch (error: any) {
    res.status(400).json(ResponseUtil.badRequest("Failed to retrieve messages", error.message));
  }
};
