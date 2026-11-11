import { prisma } from "../lib";
import { ApiError } from "../utils";
import type { LocationUpdateInput } from "../validators";

export interface LocationSnapshot {
  taskId: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

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
   * Persist before acknowledging so reconnects and separate API instances see
   * the same position. The browser sends at most one update every five seconds.
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
    await LocationService.logLocation(captainId, input);

    return snapshot;
  }

  /**
   * Latest authorized location, including after an API restart.
   */
  static async getLatestLocation(
    taskId: string
  ): Promise<LocationSnapshot | null> {
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
