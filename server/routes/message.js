import express from "express";
import Message from "../models/Message.js";
const router = express.Router();

// Get messages for a conversation
router.get("/:conversationId", async (req, res) => {
  try {
    const messages = await Message.find({ conversationId: req.params.conversationId });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Send a message
router.post("/", async (req, res) => {
  try {
    const message = await Message.create(req.body);
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
