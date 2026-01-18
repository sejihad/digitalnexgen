import mongoose from "mongoose";
const { Schema } = mongoose;

const blogSchema = new Schema(
  {
    title: { type: String, required: true },
    images: [
      {
        public_id: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
    description: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Blog", blogSchema);
