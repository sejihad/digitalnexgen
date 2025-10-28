import Chat from "../models/chat.js";

// Get chat messages between two users
export const getChatMessages = async (req, res, next) => {
  try {
    const { userId, adminId } = req.params;

    const messages = await Chat.find({
      $or: [
        { senderId: userId, receiverId: adminId },
        { senderId: adminId, receiverId: userId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("senderId", "username img")
      .populate("receiverId", "username img");

    res.status(200).json(messages);
  } catch (error) {
    next(error);
  }
};

// Send a new message
export const sendMessage = async (req, res, next) => {
  try {
    const { senderId, receiverId, text } = req.body;

    if (!senderId || !receiverId || !text) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newMessage = new Chat({
      senderId,
      receiverId,
      text,
    });

    const savedMessage = await newMessage.save();
    
    const populatedMessage = await Chat.findById(savedMessage._id)
      .populate("senderId", "username img")
      .populate("receiverId", "username img");

    res.status(201).json(populatedMessage);
  } catch (error) {
    next(error);
  }
};

// Mark messages as seen
export const markAsSeen = async (req, res, next) => {
  try {
    const { userId, adminId } = req.params;

    await Chat.updateMany(
      { senderId: adminId, receiverId: userId, seen: false },
      { seen: true }
    );

    res.status(200).json({ message: "Messages marked as seen" });
  } catch (error) {
    next(error);
  }
};

// Get unread message count
export const getUnreadCount = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const count = await Chat.countDocuments({
      receiverId: userId,
      seen: false,
    });

    res.status(200).json({ count });
  } catch (error) {
    next(error);
  }
};
