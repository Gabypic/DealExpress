import express from "express";
import {
    listPendingDeals,
    moderateDeal,
    listUsers,
    changeUserRole
} from "../controllers/admin.controller.js";

import { authenticate, requireRole } from "../middlewares/auth.middleware.js";
import { body, validationResult } from "express-validator";

const router = express.Router();

const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
};

// List pending deals (moderator/admin)
router.get(
    "/deals/pending",
    authenticate,
    requireRole(["moderator", "admin"]),
    listPendingDeals
);

// Moderate deal
router.patch(
    "/deals/:id/moderate",
    authenticate,
    requireRole(["moderator", "admin"]),
    [body("status").isIn(["approved", "rejected"])],
    handleValidation,
    moderateDeal
);

// List users (admin)
router.get(
    "/users",
    authenticate,
    requireRole(["admin"]),
    listUsers
);

// Change user role (admin)
router.patch(
    "/users/:id/role",
    authenticate,
    requireRole(["admin"]),
    [body("role").isIn(["user", "moderator", "admin"])],
    handleValidation,
    changeUserRole
);

export default router;
