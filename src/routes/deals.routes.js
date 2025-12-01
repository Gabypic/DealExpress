import express from "express";
import {
    createDeal,
    getDeals,
    getDealById,
    updateDeal,
    deleteDeal,
    searchDeals,
    voteDeal,
    removeVote
} from "../controllers/deal.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";
import { dealValidator } from "../validators/deal.validator.js";
import { validationResult } from "express-validator";

const router = express.Router();

const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
};

// List deals
router.get("/", authenticate, getDeals);

// Search deals
router.get("/search",authenticate, searchDeals);

// Get a deal
router.get("/:id", authenticate, getDealById);

// Create a deal
router.post("/", authenticate, dealValidator, handleValidation, createDeal);

// Update a deal
router.put("/:id", authenticate, dealValidator, handleValidation, updateDeal);

// Delete a deal
router.delete("/:id", authenticate, deleteDeal);

// Votes
router.post("/:id/vote", authenticate, voteDeal);
router.delete("/:id/vote", authenticate, removeVote);

export default router;
