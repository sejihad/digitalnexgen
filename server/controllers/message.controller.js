import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";

export const createMessage = async (req, res, next) => {
  try {
    const newMessage = new Message({
      conversationId: req.body.conversationId,
      userId: req.userId,
      message: req.body.message,
    });

    const savedMessage = await newMessage.save();

    await Conversation.findOneAndUpdate(
      { _id: req.body.conversationId },
      {
        $set: {
          lastMessage: req.body.message,
          readByAdmin: req.isAdmin,
          readByBuyer: !req.isAdmin,
        },
      },
      { new: true }
    );

    res.status(200).json(savedMessage);
  } catch (error) {
    console.error("Error creating message:", error.message);
    res
      .status(500)
      .json({ message: "Error saving message", error: error.message });
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const messages = await Message.find({ conversationId: req.params.id }).sort(
      "createdAt"
    );
    res.status(200).json(messages);
  } catch (error) {
    next(error);
  }
};
