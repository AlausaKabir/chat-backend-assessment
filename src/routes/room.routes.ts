import { Router } from "express";
import * as RoomController from "../controllers/room.controller.js";
import { validate } from "../middlewares/validate.js";

const router = Router();

router.post("/create", validate(["name", "isPrivate"]), RoomController.createRoom);
router.post("/join", validate(["roomId"]), RoomController.joinRoom);
router.get("/my", RoomController.listRooms);

export default router;
