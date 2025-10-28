import Conversation from "../models/Conversation.js";
import User from "../models/user.model";

// Create a new conversation
export const createConversation = async (req, res) => {
  try {
    const { members, title } = req.body;

    if (!members || members.length < 2) {
      return res.status(400).json({ message: "At least 2 members required" });
    }

    const newConversation = new Conversation({ members, title });
    const savedConversation = await newConversation.save();
    res.status(201).json(savedConversation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all conversations of a specific user
export const getUserConversations = async (req, res) => {
  try {
    const userId = req.params.userId;
    const conversations = await Conversation.find({ members: userId })
      .populate("members", "username email img"); // populate user info
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single conversation by ID
export const getConversationById = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id)
      .populate("members", "username email img");
    if (!conversation) return res.status(404).json({ message: "Conversation not found" });
    res.json(conversation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update last message in a conversation
export const updateLastMessage = async (req, res) => {
  try {
    const { lastMessage } = req.body;
    const conversation = await Conversation.findByIdAndUpdate(
      req.params.id,
      { lastMessage },
      { new: true }
    );
    if (!conversation) return res.status(404).json({ message: "Conversation not found" });
    res.json(conversation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
