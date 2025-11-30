import Deal from "../models/Deal.js";
import User from "../models/User.js";
import { validationResult } from "express-validator";

/* List pending deals (moderator/admin) */
export const listPendingDeals = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page || "1"));
        const limit = Math.max(1, parseInt(req.query.limit || "10"));
        const skip = (page - 1) * limit;

        const [total, deals] = await Promise.all([
            Deal.countDocuments({ status: "pending" }),
            Deal.find({ status: "pending" })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate({ path: "authorId", select: "username email -_id" })
        ]);

        res.json({ page, limit, total, deals });
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
};

/* Moderate a deal (approve/reject) */
export const moderateDeal = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!["approved", "rejected"].includes(status)) return res.status(400).json({ message: "Status invalide" });

        const deal = await Deal.findById(id);
        if (!deal) return res.status(404).json({ message: "Deal introuvable" });

        deal.status = status;
        await deal.save();
        res.json({ message: `Deal ${status}`, deal });
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
};

/* List users (admin) */
export const listUsers = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page || "1"));
        const limit = Math.max(1, parseInt(req.query.limit || "10"));
        const skip = (page - 1) * limit;

        const [total, users] = await Promise.all([
            User.countDocuments(),
            User.find().sort({ createdAt: -1 }).skip(skip).limit(limit).select("-password")
        ]);
        res.json({ page, limit, total, users });
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
};

/* Change role (admin) */
export const changeUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        if (!["user", "moderator", "admin"].includes(role)) return res.status(400).json({ message: "Role invalide" });

        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

        user.role = role;
        await user.save();
        res.json({ message: "Role mis à jour", user: { id: user._id, username: user.username, role: user.role } });
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
};
