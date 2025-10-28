import mongoose from "mongoose";
import { Schema } from "mongoose";

const gallerySchema = new Schema(
  {
    imageUrl: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    imageTitle: {
      type: String,
      required: true,
    },
    gitUrl: {
      type: String,
    },
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: "Service",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Gallery", gallerySchema);
