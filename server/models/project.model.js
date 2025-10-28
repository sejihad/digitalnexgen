import mongoose from "mongoose";
const { Schema } = mongoose;

const projectSchema = new Schema(
  {
    title: { type: String, required: true },
    images: [{ type: String }],
    description: { type: String, required: true },
    category: { type: String, required: true },
    subCategory: { type: String, required: true },
    url: { type: String },
    videoUrl: { type: String },
    // Optional fields used by the frontend
    client: { type: String },
    tags: [{ type: String }],
    technologies: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Project", projectSchema);
