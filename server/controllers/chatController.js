import Chat from "../models/Chat.js";

// Send a chat
export const sendChat = async (req, res) => {
  try {
    const { senderId, receiverId, text } = req.body;

    const chat = new Chat({ senderId, receiverId, text });
    await chat.save();

    res.status(201).json(chat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all chats between two users
export const getChats = async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;

    const chats = await Chat.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(chats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
