import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authenticate = async (req, res, next) => {
    try {
        const header = req.headers.authorization;
        if (!header) return res.status(401).json({ message: "Token manquant" });
        const token = header.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");
        if (!user) return res.status(401).json({ message: "Utilisateur introuvable" });
        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Token invalide", error: err.message });
    }
};

export const requireRole = (roles = []) => {
    if (!Array.isArray(roles)) roles = [roles];
    return (req, res, next) => {
        if (!req.user) return res.status(401).json({ message: "Non authentifié" });
        if (!roles.includes(req.user.role)) return res.status(403).json({ message: "Accès interdit" });
        next();
    };
};
