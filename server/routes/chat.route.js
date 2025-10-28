import express from "express";
import {
  getChatMessages,
  sendMessage,
  markAsSeen,
  getUnreadCount,
} from "../controllers/chat.controller.js";
import { verifyToken } from "../middleware/jwt.js";

const router = express.Router();

// Get chat messages between two users
router.get("/:userId/:adminId", verifyToken, getChatMessages);

// Send a new message
router.post("/", verifyToken, sendMessage);

// Mark messages as seen
router.patch("/:userId/:adminId/seen", verifyToken, markAsSeen);

// Get unread message count
router.get("/unread/:userId", verifyToken, getUnreadCount);

export default router;
