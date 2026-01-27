import mongoose from "mongoose";

const statisticSchema = new mongoose.Schema(
  {
    clientsServed: {
      type: Number,
      required: true,
      default: 0,
    },
    projectsCompleted: {
      type: Number,
      required: true,
      default: 0,
    },
    ongoingProjects: {
      type: Number,
      required: true,
      default: 0,
    },
    countriesReached: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Statistic", statisticSchema);
