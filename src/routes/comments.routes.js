import express from "express";
import {
    getCommentsForDeal,
    createComment,
    updateComment,
    deleteComment
} from "../controllers/comment.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";
import { body, validationResult } from "express-validator";

const router = express.Router();

const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
};

// Get comments for a deal
router.get("/deal/:dealId", authenticate, getCommentsForDeal);

// Create comment
router.post(
    "/deal/:dealId",
    authenticate,
    [body("content").isLength({ min: 3, max: 500 })],
    handleValidation,
    createComment
);

// Update comment
router.put(
    "/:id",
    authenticate,
    [body("content").isLength({ min: 3, max: 500 })],
    handleValidation,
    updateComment
);

// Delete comment
router.delete("/:id", authenticate, deleteComment);

export default router;
