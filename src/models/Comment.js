import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    content: { type: String, required: true, minlength: 3, maxlength: 500 },
    dealId: { type: mongoose.Schema.Types.ObjectId, ref: "Deal", required: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Comment", commentSchema);
