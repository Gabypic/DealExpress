import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { validationResult } from "express-validator";

const genToken = (user) => {
    console.log("JWT_SECRET utilisé :", process.env.JWT_SECRET);

    return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || "7d" });
};

export const register = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { username, email, password } = req.body;
        const existing = await User.findOne({ $or: [{ email }, { username }] });
        if (existing) return res.status(400).json({ message: "Username ou email déjà utilisé" });

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const user = await User.create({ username, email, password: hash });
        const token = genToken(user);

        res.status(201).json({ user: { id: user._id, username: user.username, email: user.email, role: user.role }, token });
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
};

export const login = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Identifiants invalides" });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ message: "Identifiants invalides" });

        const token = genToken(user);
        res.json({ user: { id: user._id, username: user.username, email: user.email, role: user.role }, token });
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
};

export const me = async (req, res) => {
    try {
        const user = req.user;
        res.json({ user });
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
};
