import mongoose from "mongoose";
const { Schema } = mongoose;
const packageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  desc: { type: String, required: true },
  deliveryTime: { type: Number, required: true },
  revisionNumber: { type: Number, required: true },
  regularPrice: { type: Number, required: true },
  salePrice: { type: Number, required: false },
});
const serviceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    desc: { type: String, required: true },
    category: { type: String, required: true },
    subCategory: { type: String, required: true },
    videoUrl: { type: String },
    coverImage: {
      public_id: { type: String, required: true },
      url: { type: String, required: true },
    },
    otherImages: [{ public_id: { type: String }, url: { type: String } }],
    shortTitle: { type: String, required: true },
    shortDesc: { type: String, required: true },
    features: { type: [String], required: false },
    packages: { type: [packageSchema], required: true },
    sales: { type: Number, default: 0 },
    totalStars: { type: Number, default: 0 },
    starNumber: { type: Number, default: 0 },
    averageStars: { type: Number, default: 0 },
  },
  { timestamps: true }
);
export default mongoose.model("Service", serviceSchema);
4;
