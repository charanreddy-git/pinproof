import "./config";
import http from "http";
import app from "./app";
import { prisma } from "./lib";
import { logger } from "./utils";

const PORT = process.env.PORT || 3001;

const httpServer = http.createServer(app);

httpServer.listen(PORT, () => {
  logger.info(`Server ready`, { port: PORT });
});

async function shutdown(signal: string): Promise<void> {
  logger.info(`${signal} received — shutting down gracefully`);
  httpServer.close(async () => {
    await prisma.$disconnect();
    logger.info("Server closed");
    process.exit(0);
  });

  setTimeout(() => {
    logger.error("Graceful shutdown timed out — forcing exit");
    process.exit(1);
  }, 10000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
