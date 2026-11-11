import path from "node:path";
import { prisma } from "../lib";
import {
  ApiError,
  CAPTAIN_DISCOVERY_RADIUS_KM,
  haversineDistance,
  MAX_DISTANCE_METERS,
} from "../utils";
import type { CreateTaskInput, SubmitTaskInput, UpdateTaskInput } from "../validators";
import { Prisma, TaskStatus } from "@prisma/client";
import { LocationService } from "./location.service";

/** Safe shape for public/open task listings — no phone number. */
const publicUserSelect = {
  select: { id: true, name: true, role: true },
} as const;

/** Contact shape for participants who are allowed to reach each other. */
const contactUserSelect = {
  select: { id: true, name: true, phone: true, role: true },
} as const;

/** Standard include block — attaches creator and assignee to task queries */
const taskWithUsers = {
  createdBy: contactUserSelect,
  acceptedBy: contactUserSelect,
} as const;

type TaskFilter = "available" | "accepted";
type TaskLocation = { latitude: number; longitude: number };

export class TaskService {
  /**
   * Create a new task (USER only)
   */
  static async createTask(userId: string, input: CreateTaskInput) {
    return prisma.task.create({
      data: {
        visitPlan: input.visitPlan,
        quotedPricePaise: input.visitPlan === "DETAILED" ? 249900 : 99900,
        propertyType: input.propertyType,
        title: input.title,
        description: input.description,
        targetLat: input.latitude,
        targetLng: input.longitude,
        status: TaskStatus.OPEN,
        createdById: userId,
        events: { create: { action: "CREATED", status: "OPEN", actorId: userId } },
      },
      include: taskWithUsers,
    });
  }

  /**
   * Get tasks filtered by role:
   * - USER: own created tasks
   * - CAPTAIN "available": OPEN tasks within the discovery radius
   * - CAPTAIN "accepted": own accepted tasks
   * - CAPTAIN (no filter): nearby OPEN tasks + own accepted tasks
   */
  static async getTasks(
    userId: string,
    role: "USER" | "CAPTAIN",
    filter?: TaskFilter,
    location?: TaskLocation
  ) {
    if (role === "USER") {
      return prisma.task.findMany({
        where: { createdById: userId },
        include: taskWithUsers,
        orderBy: { createdAt: "desc" },
      });
    }

    if (filter === "available") {
      return TaskService.findNearbyOpenTasks(location);
    }

    if (filter === "accepted") {
      return prisma.task.findMany({
        where: { acceptedById: userId },
        include: taskWithUsers,
        orderBy: { updatedAt: "desc" },
      });
    }

    // Default: nearby OPEN tasks (contact hidden) + own accepted tasks (contact visible)
    const [openTasks, acceptedTasks] = await Promise.all([
      TaskService.findNearbyOpenTasks(location),
      prisma.task.findMany({
        where: { acceptedById: userId },
        include: taskWithUsers,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return [...openTasks, ...acceptedTasks].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  /**
   * Open tasks inside the captain discovery radius, nearest first.
   * Captain coordinates come from the request; nothing is persisted.
   */
  private static async findNearbyOpenTasks(location?: TaskLocation) {
    if (!location) return [];

    const { latitude, longitude } = location;

    // Cheap bounding-box prefilter, then exact Haversine distance. Use a
    // conservative km-per-degree value so boundary visits are never excluded.
    const KM_PER_DEGREE = 110;
    const latDelta = CAPTAIN_DISCOVERY_RADIUS_KM / KM_PER_DEGREE;
    const lngDelta =
      CAPTAIN_DISCOVERY_RADIUS_KM /
      (KM_PER_DEGREE * Math.max(Math.cos((latitude * Math.PI) / 180), 0.01));

    const tasks = await prisma.task.findMany({
      where: {
        status: TaskStatus.OPEN,
        targetLat: { gte: latitude - latDelta, lte: latitude + latDelta },
        targetLng: { gte: longitude - lngDelta, lte: longitude + lngDelta },
      },
      include: { createdBy: publicUserSelect },
      orderBy: { createdAt: "desc" },
    });

    return tasks
      .map((task) => ({
        ...task,
        distanceKm:
          haversineDistance(
            latitude,
            longitude,
            task.targetLat,
            task.targetLng
          ) / 1000,
      }))
      .filter((task) => task.distanceKm <= CAPTAIN_DISCOVERY_RADIUS_KM)
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }

  /**
   * Get a single task by ID with access control.
   * - USER: must be the task creator
   * - CAPTAIN: task must be OPEN or assigned to them
   */
  static async getTaskById(
    taskId: string,
    userId: string,
    role: "USER" | "CAPTAIN"
  ) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        ...taskWithUsers,
        photos: { select: { id: true, filename: true, createdAt: true }, orderBy: { createdAt: "asc" } },
        events: { orderBy: { createdAt: "asc" } },
      },
    });

    if (!task) {
      throw ApiError.notFound("Task not found");
    }

    if (role === "USER" && task.createdById !== userId) {
      throw ApiError.forbidden("You do not have access to this task");
    }

    if (
      role === "CAPTAIN" &&
      task.status !== "OPEN" &&
      task.acceptedById !== userId
    ) {
      throw ApiError.forbidden("You do not have access to this task");
    }

    // An unclaimed task is public, but the requester's phone number is not.
    if (role === "CAPTAIN" && task.status === "OPEN") {
      return {
        ...task,
        events: [],
        createdBy: {
          id: task.createdBy.id,
          name: task.createdBy.name,
          role: task.createdBy.role,
        },
      };
    }

    return task;
  }

  static async getLatestLocation(taskId: string, userId: string) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw ApiError.notFound("Visit not found");
    if (task.createdById !== userId && task.acceptedById !== userId) throw ApiError.forbidden("You do not have access to this location");
    return LocationService.getLatestLocation(taskId);
  }

  static async getEvidence(taskId: string, userId: string) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw ApiError.notFound("Visit not found");
    if (task.createdById !== userId && task.acceptedById !== userId) {
      throw ApiError.forbidden("You do not have access to this proof");
    }
    const evidence = await prisma.evidence.findUnique({ where: { taskId } });
    if (evidence) return { data: evidence.data, contentType: evidence.contentType };
    return { path: await TaskService.getEvidencePath(taskId, userId) };
  }

  static async getPhoto(taskId: string, photoId: string, userId: string) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw ApiError.notFound("Visit not found");
    if (task.createdById !== userId && task.acceptedById !== userId) {
      throw ApiError.forbidden("You do not have access to this proof");
    }
    const photo = await prisma.proofPhoto.findFirst({ where: { id: photoId, taskId } });
    if (!photo) throw ApiError.notFound("Photo not found");
    return photo;
  }

  static async getEvidencePath(taskId: string, userId: string) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw ApiError.notFound("Visit not found");
    if (task.createdById !== userId && task.acceptedById !== userId) {
      throw ApiError.forbidden("You do not have access to this proof");
    }
    if (!task.evidenceImage) throw ApiError.notFound("Proof not available yet");
    const filename = path.basename(task.evidenceImage);
    if (task.evidenceImage !== `/uploads/${filename}` || !filename) {
      throw ApiError.notFound("Proof not available");
    }
    return path.join(__dirname, "../../uploads", filename);
  }

  /**
   * Captain accepts a task (OPEN → ACCEPTED).
   * Uses a transaction to prevent two captains accepting the same task simultaneously.
   */
  static async acceptTask(taskId: string, captainId: string) {
    return prisma.$transaction(async (tx) => {
      const task = await tx.task.findUnique({ where: { id: taskId } });

      if (!task) throw ApiError.notFound("Task not found");
      if (task.status !== TaskStatus.OPEN) {
        throw ApiError.badRequest("Task is no longer available");
      }

      // Conditional update: two inspectors can read OPEN at the same time,
      // but only one can move the row out of OPEN.
      const claimed = await tx.task.updateMany({
        where: { id: taskId, status: TaskStatus.OPEN, updatedAt: task.updatedAt },
        data: {
          status: TaskStatus.ACCEPTED,
          acceptedById: captainId,
        },
      });

      if (claimed.count === 0) {
        throw ApiError.badRequest("Task is no longer available");
      }

      await tx.taskEvent.create({ data: { taskId, action: "ACCEPTED", status: "ACCEPTED", actorId: captainId } });

      return tx.task.findUniqueOrThrow({
        where: { id: taskId },
        include: taskWithUsers,
      });
    });
  }

  /**
   * Captain starts a task (ACCEPTED → IN_PROGRESS).
   * Wrapped in a transaction to guard against duplicate start requests.
   */
  static async startTask(taskId: string, captainId: string) {
    return TaskService.transition(taskId, captainId, "CAPTAIN", ["ACCEPTED"], { status: "IN_PROGRESS" }, "STARTED");
  }

  /**
   * Captain submits evidence (IN_PROGRESS → SUBMITTED).
   * Validates GPS proximity via Haversine formula before accepting submission.
   */
  static async submitTask(
    taskId: string,
    captainId: string,
    input: SubmitTaskInput,
    imagePath: string,
    evidence?: { data: Buffer; contentType: string },
    photos: { data: Buffer; contentType: string; filename: string }[] = []
  ) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });

    if (!task) throw ApiError.notFound("Task not found");
    if (task.acceptedById !== captainId) {
      throw ApiError.forbidden("You are not assigned to this task");
    }
    if (task.status !== TaskStatus.IN_PROGRESS) {
      throw ApiError.badRequest("Task must be IN_PROGRESS to submit evidence");
    }

    if (input.evidenceSource === "CAMERA") {
      const captured = input.capturedAt ? Date.parse(input.capturedAt) : NaN;
      if (!Number.isFinite(captured) || captured > Date.now() + 60000 || Date.now() - captured > 15 * 60000) {
        throw ApiError.badRequest("Take a fresh photo before submitting (within 15 minutes)");
      }
    }
    if (input.accuracy == null || input.accuracy > MAX_DISTANCE_METERS) {
      throw ApiError.badRequest("GPS accuracy must be within 100 metres. Refresh your location and try again.");
    }
    const distance = haversineDistance(
      task.targetLat,
      task.targetLng,
      input.latitude,
      input.longitude
    );

    if (distance > MAX_DISTANCE_METERS) {
      throw ApiError.badRequest(
        `Too far from target. Distance: ${Math.round(distance)}m, maximum allowed: ${MAX_DISTANCE_METERS}m`
      );
    }

    const save = async (db: Prisma.TransactionClient) => {
      const updated = await db.task.updateMany({
        where: {
          id: taskId,
          acceptedById: captainId,
          status: TaskStatus.IN_PROGRESS,
          updatedAt: task.updatedAt,
        },
        data: {
          status: TaskStatus.SUBMITTED,
          evidenceImage: imagePath,
          evidenceLat: input.latitude,
          evidenceLng: input.longitude,
          evidenceAccuracy: input.accuracy ?? null,
          evidenceSource: input.evidenceSource,
          evidenceCapturedAt: input.evidenceSource === "CAMERA" && input.capturedAt ? new Date(input.capturedAt) : null,
          evidenceSubmittedAt: new Date(),
          inspectorNotes: input.inspectorNotes || null,
          revisionNote: null,
        },
      });

      if (updated.count === 0) {
        throw ApiError.badRequest("Task must be IN_PROGRESS to submit evidence");
      }

      if (evidence) {
        const stored = { data: new Uint8Array(evidence.data), contentType: evidence.contentType };
        await db.evidence.upsert({
          where: { taskId },
          create: { taskId, ...stored },
          update: stored,
        });
      }
      await db.proofPhoto.deleteMany({ where: { taskId } });
      if (photos.length) {
        await db.proofPhoto.createMany({ data: photos.map((photo) => ({
          taskId, data: new Uint8Array(photo.data), contentType: photo.contentType, filename: photo.filename,
        })) });
      }
      await db.taskEvent.create({ data: {
        taskId, action: "SUBMITTED", status: "SUBMITTED", actorId: captainId,
        note: input.inspectorNotes || null,
      } });
      return db.task.findUniqueOrThrow({
        where: { id: taskId },
        include: taskWithUsers,
      });
    };
    // Photo bytes and the SUBMITTED transition commit together.
    return prisma.$transaction(save);
  }

  /**
   * User marks a task as completed (SUBMITTED → COMPLETED).
   * Wrapped in a transaction to guard against duplicate complete requests.
   */
  static async completeTask(taskId: string, userId: string) {
    return TaskService.transition(taskId, userId, "USER", ["SUBMITTED"], {
      status: "COMPLETED", completedAt: new Date(),
    }, "COMPLETED");
  }

  static async updateTask(taskId: string, userId: string, input: UpdateTaskInput) {
    return TaskService.transition(taskId, userId, "USER", ["OPEN"], {
      title: input.title, description: input.description, targetLat: input.latitude, targetLng: input.longitude,
    }, "UPDATED");
  }

  static async cancelTask(taskId: string, userId: string, reason: string) {
    return TaskService.transition(taskId, userId, "USER", ["OPEN", "ACCEPTED"], {
      status: "CANCELLED", cancellationReason: reason,
    }, "CANCELLED", reason);
  }

  static async releaseTask(taskId: string, captainId: string, reason: string) {
    return TaskService.transition(taskId, captainId, "CAPTAIN", ["ACCEPTED"], {
      status: "OPEN", acceptedById: null,
    }, "RELEASED", reason);
  }

  static async requestRevision(taskId: string, userId: string, reason: string) {
    return TaskService.transition(taskId, userId, "USER", ["SUBMITTED"], {
      status: "IN_PROGRESS", revisionNote: reason,
    }, "REVISION_REQUESTED", reason);
  }

  private static async transition(
    taskId: string, actorId: string, role: "USER" | "CAPTAIN", allowed: TaskStatus[],
    data: Prisma.TaskUncheckedUpdateManyInput, action: string, note?: string,
  ) {
    return prisma.$transaction(async (tx) => {
      const task = await tx.task.findUnique({ where: { id: taskId } });
      if (!task) throw ApiError.notFound("Visit not found");
      if ((role === "USER" ? task.createdById : task.acceptedById) !== actorId) {
        throw ApiError.forbidden("You do not have permission to change this visit");
      }
      if (!allowed.includes(task.status)) {
        throw ApiError.conflict("This action is no longer available. Refresh the visit to see its current status.");
      }
      const updated = await tx.task.updateMany({
        where: { id: taskId, status: task.status, updatedAt: task.updatedAt }, data,
      });
      if (!updated.count) throw ApiError.conflict("The visit changed. Refresh and try again.");
      const result = await tx.task.findUniqueOrThrow({ where: { id: taskId }, include: taskWithUsers });
      await tx.taskEvent.create({ data: { taskId, action, status: result.status, actorId, note } });
      return result;
    });
  }
}
