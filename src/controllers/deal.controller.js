import Deal from "../models/Deal.js";
import Vote from "../models/Vote.js";
import Comment from "../models/Comment.js";
import { validationResult } from "express-validator";
import mongoose from "mongoose";

/**
 * Helper to compute temperature
 * temperature = hot_count - cold_count
 */
const computeTemperature = async (dealId) => {
    const hot = await Vote.countDocuments({ dealId, type: "hot" });
    const cold = await Vote.countDocuments({ dealId, type: "cold" });
    return hot - cold;
};

export const createDeal = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
        const data = req.body;
        data.authorId = req.user._id;
        data.status = "pending";
        const deal = await Deal.create(data);
        res.status(201).json({ deal });
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
};

export const getDeals = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page || "1"));
        const limit = Math.max(1, parseInt(req.query.limit || "10"));
        const skip = (page - 1) * limit;

        const filter = {};
        // if not admin/moderator, only approved
        if (!req.user || req.user.role === "user") {
            filter.status = "approved";
        }

        const [total, deals] = await Promise.all([
            Deal.countDocuments(filter),
            Deal.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate({ path: "authorId", select: "username email role createdAt -_id" })
        ]);

        // attach temperature
        const dealsWithTemp = await Promise.all(deals.map(async d => {
            const temp = await computeTemperature(d._id);
            return { ...d.toObject(), temperature: temp };
        }));

        res.json({ page, limit, total, deals: dealsWithTemp });
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
};

export const searchDeals = async (req, res) => {
    try {
        const q = req.query.q || "";
        const regex = new RegExp(q, "i");
        const filter = { $or: [{ title: regex }, { description: regex }] };

        // status filter for non-moderator/admin
        if (!req.user || req.user.role === "user") {
            filter.status = "approved";
        }

        const deals = await Deal.find(filter).sort({ createdAt: -1 })
            .populate({ path: "authorId", select: "username email -_id" });

        const results = await Promise.all(deals.map(async d => {
            const temp = await computeTemperature(d._id);
            return { ...d.toObject(), temperature: temp };
        }));

        res.json({ total: results.length, results });
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
};

export const getDealById = async (req, res) => {
    try {
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "ID invalide" });

        const deal = await Deal.findById(id)
            .populate({ path: "authorId", select: "username email -_id" });

        if (!deal) return res.status(404).json({ message: "Deal introuvable" });

        // comments
        const comments = await Comment.find({ dealId: deal._id })
            .sort({ createdAt: -1 })
            .populate({ path: "authorId", select: "username -_id" });

        const temperature = await computeTemperature(deal._id);

        res.json({ deal: { ...deal.toObject(), temperature }, comments, votesCount: {
                hot: await Vote.countDocuments({ dealId: deal._id, type: "hot" }),
                cold: await Vote.countDocuments({ dealId: deal._id, type: "cold" })
            } });
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
};

export const updateDeal = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const deal = await Deal.findById(req.params.id);
        if (!deal) return res.status(404).json({ message: "Deal introuvable" });

        // only owner or admin allowed (ownership middleware recommended to use)
        if (deal.authorId.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({ message: "Permission refusée" });
        }

        if (deal.status !== "pending" && req.user.role === "user") {
            return res.status(400).json({ message: "Impossible de modifier un deal déjà modéré" });
        }

        // update fields allowed
        const { title, description, price, originalPrice, url, category } = req.body;
        if (title) deal.title = title;
        if (description) deal.description = description;
        if (price !== undefined) deal.price = price;
        if (originalPrice !== undefined) deal.originalPrice = originalPrice;
        if (url !== undefined) deal.url = url;
        if (category) deal.category = category;

        await deal.save();
        res.json({ deal });
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
};

export const deleteDeal = async (req, res) => {
    try {
        const deal = await Deal.findById(req.params.id);
        if (!deal) return res.status(404).json({ message: "Deal introuvable" });

        // owner or admin
        if (deal.authorId.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({ message: "Permission refusée" });
        }

        await Promise.all([
            Deal.findByIdAndDelete(deal._id),
            Comment.deleteMany({ dealId: deal._id }),
            Vote.deleteMany({ dealId: deal._id })
        ]);

        res.json({ message: "Deal supprimé" });
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
};

/* Votes endpoints */

export const voteDeal = async (req, res) => {
    try {
        const dealId = req.params.id;
        const { type } = req.body;
        if (!["hot", "cold"].includes(type)) return res.status(400).json({ message: "Type invalide" });

        const existing = await Vote.findOne({ dealId, userId: req.user._id });
        if (existing) {
            // update existing
            existing.type = type;
            await existing.save();
        } else {
            // create
            await Vote.create({ dealId, userId: req.user._id, type });
        }

        const temperature = await computeTemperature(dealId);
        res.json({ message: "Vote enregistré", temperature });
    } catch (err) {
        // handle unique index error (rare)
        if (err.code === 11000) {
            return res.status(400).json({ message: "Vote déjà existant" });
        }
        res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
};

export const removeVote = async (req, res) => {
    try {
        const dealId = req.params.id;
        await Vote.deleteOne({ dealId, userId: req.user._id });
        const temperature = await computeTemperature(dealId);
        res.json({ message: "Vote retiré", temperature });
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
};
