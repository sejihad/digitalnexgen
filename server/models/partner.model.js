import mongoose from "mongoose";
const { Schema } = mongoose;

const partnerSchema = new Schema(
  {
    name: { type: String, required: true },
    logo: {
      public_id: { type: String, required: true },
      url: { type: String, required: true },
    },
    website: { type: String },
  },
  { timestamps: true },
);

export default mongoose.model("Partner", partnerSchema);
