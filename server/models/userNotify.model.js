import mongoose from "mongoose";

const userNotifySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    notify: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Notify",
      required: true,
      index: true,
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    autoDeleteAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("UserNotify", userNotifySchema);
