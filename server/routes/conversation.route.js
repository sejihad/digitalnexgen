import express from "express";
import {
  attachServiceToConversation,
  createOrGetConversation,
  deleteConversation,
  getAllConversationsAdmin,
  getConversationCount,
  getConversations,
  getSingleConversation,
  markConversationRead,
} from "../controllers/conversation.controller.js";
import { verifyToken } from "../middleware/jwt.js";

const router = express.Router();

// List conversations for current user (customer) OR admin (joined)
router.get("/", verifyToken, getConversations);

// Get single conversation by mongo _id
router.get("/single/:id", verifyToken, getSingleConversation);

// Count (for badge)
router.get("/count", verifyToken, getConversationCount);

// Admin: list all conversations (platform wide)
router.get("/admin/all", verifyToken, getAllConversationsAdmin);

// Admin: send sms to customer of the conversation
// router.post("/:id/send-sms", verifyToken, sendSmsToConversation);

// Attach service/gig to conversation (optional gig system)
router.post("/:id/attach-service", verifyToken, attachServiceToConversation);

// ✅ Create OR Get (1 user = 1 thread)
router.post("/", verifyToken, createOrGetConversation);

// ✅ mark read
router.put("/:id/read", verifyToken, markConversationRead);

// Delete conversation
router.delete("/:id", verifyToken, deleteConversation);

export default router;
