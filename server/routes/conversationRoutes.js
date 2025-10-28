import express from "express";
import {
  createConversation,
  getUserConversations,
  getConversationById,
  updateLastMessage
} from "../controllers/conversationController.js";

const router = express.Router();

// Create conversation
router.post("/", createConversation);

// Get all conversations of a user
router.get("/user/:userId", getUserConversations);

// Get single conversation by ID
router.get("/:id", getConversationById);

// Update last message
router.put("/:id", updateLastMessage);

export default router;
