require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const path = require("path");

const app = express();

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(
	cors({
		origin: process.env.FRONTEND_URL || "*",
		credentials: true,
	}),
);
app.use(express.json());
app.use(morgan("dev"));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
app.use("/api/", limiter);

// ── Static frontend ────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, "../frontend")));

// ── Routes ─────────────────────────────────────────────────────────────────────
app.use("/api/auth", require("./routes/auth"));
app.use("/api/questions", require("./routes/questions"));
app.use("/api/progress", require("./routes/progress"));

// Health check
app.get("/api/health", (req, res) => {
	res.json({
		status: "ok",
		mongodb:
			mongoose.connection.readyState === 1 ? "connected" : "disconnected",
		uptime: process.uptime(),
		timestamp: new Date().toISOString(),
	});
});

// Catch-all: serve frontend
app.get("*", (req, res) => {
	res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// ── Error Handler ──────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(err.status || 500).json({
		success: false,
		message: err.message || "Internal Server Error",
	});
});

// ── MongoDB Connection ─────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const MONGO_URI =
	process.env.MONGODB_URI || "mongodb://localhost:27017/dsa_tracker";

mongoose
	.connect(MONGO_URI)
	.then(() => {
		console.log(
			"✅  MongoDB connected:",
			MONGO_URI.replace(/\/\/.*@/, "//***@"),
		);
		app.listen(PORT, () => {
			console.log(`🚀  Server running on http://localhost:${PORT}`);
			console.log(`📊  API: http://localhost:${PORT}/api`);
		});
	})
	.catch((err) => {
		console.error("❌  MongoDB connection failed:", err.message);
		process.exit(1);
	});

// Graceful shutdown
process.on("SIGINT", async () => {
	await mongoose.connection.close();
	console.log("MongoDB connection closed.");
	process.exit(0);
});
