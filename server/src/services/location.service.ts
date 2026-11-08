import { prisma } from "../lib";
import { ApiError } from "../utils";
import type { LocationUpdateInput } from "../validators";

export interface LocationSnapshot {
  taskId: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

// Live location is served from memory between persisted log writes. The database
// remains the source of truth after a restart; entries here are process-local.
const latestLocations = new Map<string, LocationSnapshot>();
const lastLocationLog = new Map<string, number>();
const LOCATION_LOG_INTERVAL_MS = 60_000;

export class LocationService {
  /**
   * Check that the inspector is assigned to this visit and that it is currently
   * in progress. Used before accepting a location update.
   */
  static async validateCaptainForTask(
    captainId: string,
    taskId: string
  ): Promise<void> {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { status: true, acceptedById: true },
    });

    if (!task) {
      throw ApiError.notFound(`Task ${taskId} not found`);
    }

    if (task.status !== "IN_PROGRESS") {
      throw ApiError.conflict(`Task ${taskId} is not IN_PROGRESS`);
    }

    if (task.acceptedById !== captainId) {
      throw ApiError.forbidden(
        `Captain ${captainId} is not assigned to task ${taskId}`
      );
    }
  }

  static async logLocation(
    captainId: string,
    input: LocationUpdateInput
  ): Promise<void> {
    await prisma.locationLog.create({
      data: {
        latitude: input.latitude,
        longitude: input.longitude,
        taskId: input.taskId,
        captainId,
      },
    });
  }

  /**
   * Validates an inspector, keeps the latest point in memory for polling, and
   * persists a location log at most once per minute per inspector/task.
   */
  static async recordLocation(
    captainId: string,
    input: LocationUpdateInput
  ): Promise<LocationSnapshot> {
    await LocationService.validateCaptainForTask(captainId, input.taskId);

    const snapshot: LocationSnapshot = {
      taskId: input.taskId,
      latitude: input.latitude,
      longitude: input.longitude,
      timestamp: new Date().toISOString(),
    };
    latestLocations.set(input.taskId, snapshot);

    const now = Date.now();
    const throttleKey = `${captainId}:${input.taskId}`;
    const lastLogTime = lastLocationLog.get(throttleKey) ?? 0;

    if (process.env.VERCEL || now - lastLogTime > LOCATION_LOG_INTERVAL_MS) {
      await LocationService.logLocation(captainId, input);
      lastLocationLog.set(throttleKey, now);
    }

    return snapshot;
  }

  /**
   * Latest authorized location for a visit. Prefers the in-memory update from
   * the current process and falls back to the most recent persisted log.
   */
  static async getLatestLocation(
    taskId: string
  ): Promise<LocationSnapshot | null> {
    const live = latestLocations.get(taskId);
    if (live && !process.env.VERCEL) return live;

    const persisted = await prisma.locationLog.findFirst({
      where: { taskId },
      orderBy: { timestamp: "desc" },
      select: {
        taskId: true,
        latitude: true,
        longitude: true,
        timestamp: true,
      },
    });

    return persisted
      ? {
          taskId: persisted.taskId,
          latitude: persisted.latitude,
          longitude: persisted.longitude,
          timestamp: persisted.timestamp.toISOString(),
        }
      : null;
  }
}
