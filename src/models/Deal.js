import mongoose from "mongoose";

const dealSchema = new mongoose.Schema({
    title: { type: String, required: true, minlength: 5, maxlength: 100 },
    description: { type: String, required: true, minlength: 10, maxlength: 500 },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number },
    url: { type: String },
    category: { type: String, enum: ["High-Tech", "Maison", "Mode", "Loisirs", "Autre"], default: "Autre" },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Deal", dealSchema);
