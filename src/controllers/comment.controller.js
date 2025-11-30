import Comment from "../models/Comment.js";
import Deal from "../models/Deal.js";
import { validationResult } from "express-validator";

/* GET comments for a deal */
export const getCommentsForDeal = async (req, res) => {
    try {
        const { dealId } = req.params;
        const deal = await Deal.findById(dealId);
        if (!deal) return res.status(404).json({ message: "Deal introuvable" });

        const comments = await Comment.find({ dealId })
            .sort({ createdAt: -1 })
            .populate({ path: "authorId", select: "username -_id" });

        res.json({ total: comments.length, comments });
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
};

export const createComment = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { dealId } = req.params;
        const { content } = req.body;

        const deal = await Deal.findById(dealId);
        if (!deal) return res.status(404).json({ message: "Deal introuvable" });

        const comment = await Comment.create({ content, dealId, authorId: req.user._id });
        const populated = await comment.populate({ path: "authorId", select: "username -_id" });
        res.status(201).json({ comment: populated });
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
};

export const updateComment = async (req, res) => {
    try {
        const { id } = req.params; // comment id
        const comment = await Comment.findById(id);
        if (!comment) return res.status(404).json({ message: "Commentaire introuvable" });

        if (comment.authorId.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({ message: "Permission refusée" });
        }

        const { content } = req.body;
        if (content) comment.content = content;
        await comment.save();
        res.json({ comment });
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
};

export const deleteComment = async (req, res) => {
    try {
        const { id } = req.params; // comment id
        const comment = await Comment.findById(id);
        if (!comment) return res.status(404).json({ message: "Commentaire introuvable" });

        if (comment.authorId.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({ message: "Permission refusée" });
        }

        await comment.deleteOne();
        res.json({ message: "Commentaire supprimé" });
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
};
