import mongoose from "mongoose";
const { Schema } = mongoose;

const blogSchema = new Schema(
  {
    title: { type: String, required: true },
    images: [{ type: String }],
    description: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Blog", blogSchema);
