import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import "./config/database.js";

import authRoutes from "./routes/auth.routes.js";
import dealRoutes from "./routes/deals.routes.js";
import commentRoutes from "./routes/comments.routes.js";
import adminRoutes from "./routes/admin.routes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/deals", dealRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/admin", adminRoutes);

// Health
app.get("/", (req, res) => res.json({ ok: true, env: process.env.NODE_ENV || "dev" }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`DealExpress API listening on port ${PORT}`));
