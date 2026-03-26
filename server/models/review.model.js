import mongoose from "mongoose";
const { Schema } = mongoose;

const reviewSchema = new Schema(
  {
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },

    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: false,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    name: {
      type: String,

      trim: true,
      default: "",
    },

    userImage: {
      url: {
        type: String,
        default: "",
      },
      public_id: {
        type: String,
        default: "",
        required: false,
      },
    },

    star: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    desc: {
      type: String,
      required: true,
      trim: true,
    },
    reviewDate: {
      type: Date,
      default: Date.now,
    },

    country: {
      type: String,
      trim: true,
      default: "",
    },
    isVisible: {
      type: Boolean,
      default: true,
    },

    createdSource: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      select: false,
    },

    isAdminEdited: {
      type: Boolean,
      default: false,
      select: false,
    },

    editedByAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      select: false,
      default: null,
    },

    adminEditedAt: {
      type: Date,
      default: null,
      select: false,
    },
  },
  { timestamps: true },
);

reviewSchema.index(
  { orderId: 1 },
  {
    unique: true,
    partialFilterExpression: { orderId: { $exists: true, $ne: null } },
  },
);

export default mongoose.model("Review", reviewSchema);
