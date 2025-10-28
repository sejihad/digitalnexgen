import mongoose from "mongoose";
const { Schema } = mongoose;

const partnerSchema = new Schema(
  {
    name: { type: String, required: true },
    logoUrl: { type: String, required: true },
    website: { type: String }, 
  },
  { timestamps: true }
);

export default mongoose.model("Partner", partnerSchema);
