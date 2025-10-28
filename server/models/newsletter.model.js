import mongoose from "mongoose";
const { Schema } = mongoose;

const newsletterSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true, 
      lowercase: true, 
      trim: true,
    },
  },
  {
    timestamps: true, 
  }
);

export default mongoose.model("Newsletter", newsletterSchema);
