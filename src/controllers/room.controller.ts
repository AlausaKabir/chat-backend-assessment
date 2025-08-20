import type { Response } from "express";
import * as RoomService from "../services/room.service.js";
import type { AuthenticatedRequest } from "../middlewares/auth.js";
import { ResponseUtil } from "../utils/response.util.js";

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
