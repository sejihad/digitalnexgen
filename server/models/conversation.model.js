import mongoose from "mongoose";
const { Schema } = mongoose;

const linkedServiceSchema = new Schema(
  {
    serviceId: { type: String, required: false },
    title: { type: String, required: false },
    subCategory: { type: String, required: false },
    coverImage: { type: String, required: false },
    savedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const conversationSchema = new Schema(
  {
    // ✅ 1 user = 1 conversation
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // ✅ enforce single conversation per user
      index: true,
    },

    // ✅ multiple admin can join this conversation
    adminIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // ✅ read states
    readByCustomer: { type: Boolean, default: true },
    readByAdmins: { type: Boolean, default: false },

    lastMessage: { type: String, default: "" },

    // ✅ optional: gig list (array)
    linkedServices: { type: [linkedServiceSchema], default: [] },
  },
  { timestamps: true },
);

export default mongoose.model("Conversation", conversationSchema);
