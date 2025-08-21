import { Router } from "express";
import * as RoomController from "../controllers/room.controller";
import { validate } from "../middlewares/validate";

const router = Router();

router.post("/create", validate(["name"]), RoomController.createRoom);
router.post("/join", validate(["inviteCode"]), RoomController.joinRoom);
router.get("/my", RoomController.listRooms);
router.get("/:roomId/messages", RoomController.getRoomMessages);

export default router;
