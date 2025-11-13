import mongoose from "mongoose";

const leaderboardSchema = new mongoose.Schema({
  totalCount: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
  users: [
    {
      name: String,
      amount: Number,
    },
  ],
});

export default mongoose.model("leaderboard", leaderboardSchema);
