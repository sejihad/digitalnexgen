import express from "express";
import { verifyToken } from "../middleware/jwt.js";
import {
  createConversation,
  getConversationCount,
  getConversations,
  getSingleConversation,
  updateConversation,
  getAllConversationsAdmin,
  sendSmsToConversation,
  deleteConversation,
  attachServiceToConversation,
} from "../controllers/conversation.controller.js";

const router = express.Router();

router.get("/", verifyToken, getConversations);
router.get("/single/:id", verifyToken, getSingleConversation);
router.get("/count", verifyToken, getConversationCount);
router.get("/admin/all", verifyToken, getAllConversationsAdmin);
router.post("/:id/send-sms", verifyToken, sendSmsToConversation);
router.post("/:id/attach-service", verifyToken, attachServiceToConversation);
router.post("/", verifyToken, createConversation);
router.put("/:id", verifyToken, updateConversation);
router.delete("/:id", verifyToken, deleteConversation);

export default router;
