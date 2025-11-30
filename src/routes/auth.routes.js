import express from "express";
import { register, login, me } from "../controllers/auth.controller.js";
import { registerValidator, loginValidator } from "../validators/auth.validator.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validationResult } from "express-validator";

const router = express.Router();

const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
};

router.post("/register", registerValidator, handleValidation, register);
router.post("/login", loginValidator, handleValidation, login);
router.get("/me", authenticate, me);

export default router;
