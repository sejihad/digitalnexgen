import mongoose from "mongoose";

const userNotifySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    notify: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Notify",
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("UserNotify", userNotifySchema);
