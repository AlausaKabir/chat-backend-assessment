import type { Response } from "express";
import * as RoomService from "../services/room.service.js";
import type { AuthenticatedRequest } from "../middlewares/auth.js";

export const createRoom = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    const room = await RoomService.createRoom(req.body, req.user.id);
    res.status(201).json(room);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const joinRoom = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    const result = await RoomService.joinRoom(req.body, req.user.id);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const listRooms = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    const rooms = await RoomService.listRooms(req.user.id);
    res.status(200).json(rooms);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
