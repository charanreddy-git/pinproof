import express from "express";
import cors from "cors";
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
app.use("/uploads", (_req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.sendStatus(404);
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

// Health check — verifies DB connectivity
app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({
      status: "error",
      success: false,
      message: "The database is temporarily unavailable. Please try again shortly.",
      timestamp: new Date().toISOString(),
    });
  }
});

// Readiness checks the columns and tables used by the deployed visit workflow,
// not just whether PostgreSQL accepts connections.
app.get("/api/ready", async (_req, res) => {
  try {
    await prisma.$queryRawUnsafe(
      'SELECT "inspectorNotes", "revisionNote", "cancellationReason", "completedAt" FROM "Task" LIMIT 0'
    );
    await prisma.$queryRawUnsafe('SELECT "taskId" FROM "TaskEvent" LIMIT 0');
    await prisma.$queryRawUnsafe('SELECT "taskId" FROM "ProofPhoto" LIMIT 0');
    res.json({ status: "ok" });
  } catch (error) {
    logger.error("Database schema is not ready for this release", error);
    res.status(503).json({ status: "error", success: false, message: "Database schema is not ready. Apply the pending migrations." });
  }
});

app.use("/api", (_req, res) => {
  res.status(404).json({ success: false, message: "API endpoint not found." });
});

// Global error handler (must be last)
app.use(errorHandler);

export default app;
