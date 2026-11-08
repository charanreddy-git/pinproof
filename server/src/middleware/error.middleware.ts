import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { ApiError, logger } from "../utils";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Zod validation errors
  if (err instanceof ZodError) {
    const errors = err.issues.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    res.status(400).json({ success: false, message: "Validation failed", errors });
    return;
  }

  // Custom API errors
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }

  // Multer file upload errors
  if (err.name === "MulterError") {
    res.status(400).json({ success: false, message: err.message });
    return;
  }

  // Prisma unique constraint violation
  if (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === "P2002"
  ) {
    res.status(409).json({
      success: false,
      message: "A record with this value already exists",
    });
    return;
  }

  // Connection failures and exhausted/timed-out connections are temporary
  // service outages, not validation errors or raw Prisma messages for clients.
  if (
    err instanceof Prisma.PrismaClientInitializationError ||
    (err instanceof Prisma.PrismaClientKnownRequestError &&
      ["P1001", "P1002", "P1008", "P1017", "P2024"].includes(err.code))
  ) {
    logger.error("Database unavailable; check PostgreSQL and DATABASE_URL", err);
    res.status(503).json({
      success: false,
      message: "The database is temporarily unavailable. Please try again shortly.",
    });
    return;
  }

  if (err instanceof SyntaxError && "type" in err && err.type === "entity.parse.failed") {
    res.status(400).json({ success: false, message: "Request body must be valid JSON." });
    return;
  }

  // Unexpected errors — log with full context, return safe message in production
  logger.error("Unhandled error", err);
  res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === "development" ? err.message : "Internal server error",
  });
}
