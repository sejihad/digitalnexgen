import mongoose from "mongoose";
const { Schema } = mongoose;

const conversationSchema = new Schema(
  {
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User", // Reference to your existing User model
        required: true,
      },
    ],
    title: {
      type: String,
      default: null, // Optional, useful for group chats
    },
    lastMessage: {
      type: String,
      default: "", // Optional last message preview
    },
  },
  { timestamps: true }
);

export default mongoose.model("Conversation", conversationSchema);
