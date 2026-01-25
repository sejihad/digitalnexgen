import mongoose, { Schema } from "mongoose";

const gallerySchema = new Schema(
  {
    image: {
      public_id: { type: String, required: true },
      url: { type: String, required: true },
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
  { timestamps: true },
);

export default mongoose.model("Gallery", gallerySchema);
