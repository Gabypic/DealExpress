import mongoose from "mongoose";

const voteSchema = new mongoose.Schema({
    type: { type: String, enum: ["hot", "cold"], required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    dealId: { type: mongoose.Schema.Types.ObjectId, ref: "Deal", required: true },
    createdAt: { type: Date, default: Date.now }
});

// prevent duplicate pair (userId + dealId) at DB level (unique index)
voteSchema.index({ userId: 1, dealId: 1 }, { unique: true });

export default mongoose.model("Vote", voteSchema);
