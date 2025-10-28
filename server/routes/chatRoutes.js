import express from "express";
import { sendChat, getChats } from "../controllers/chatController.js";

const router = express.Router();

router.post("/", sendChat);
router.get("/:senderId/:receiverId", getChats);

export default router;
