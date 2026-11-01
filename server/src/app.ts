import express from "express";
import cors from "cors";
import path from "path";
import { authRoutes, taskRoutes } from "./routes";
import { errorHandler } from "./middleware";
import { prisma } from "./lib";
import { logger } from "./utils";

const app = express();

// Render terminates TLS at its proxy. Trust the first hop so rate limiting and
// request logging see the real client IP instead of the proxy address.
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, _res, next) => {
  logger.debug(`${req.method} ${req.path}`);
  next();
});

// Static files — uploaded evidence images
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

// Health check — verifies DB connectivity
app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: "error", timestamp: new Date().toISOString() });
  }
});

// Global error handler (must be last)
app.use(errorHandler);

export default app;
