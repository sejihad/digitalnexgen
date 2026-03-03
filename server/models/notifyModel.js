const mongoose = require("mongoose");

const notifySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      default: null,
    },
    image: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },

    expiresAt: {
      type: Date,
      default: () => Date.now() + 30 * 24 * 60 * 60 * 1000,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Notify", notifySchema);
