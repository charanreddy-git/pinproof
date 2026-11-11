import { Request, Response, NextFunction } from "express";
import { LocationService, TaskService } from "../services";
import {
  createTaskSchema,
  locationUpdateSchema,
  submitTaskSchema,
  taskQuerySchema,
  taskReasonSchema,
  updateTaskSchema,
} from "../validators";
import { ApiError, resolveGoogleMapsUrl } from "../utils";

/** Express 5 types `req.params` values as `string | string[]`; named route params are always strings at runtime. */
function paramId(req: Request): string {
  const id = req.params.id;
  return Array.isArray(id) ? id[0] : id;
}

export class TaskController {
  static async updateTask(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await TaskService.updateTask(paramId(req), req.user!.userId, updateTaskSchema.parse(req.body));
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  static async cancelTask(req: Request, res: Response, next: NextFunction) {
    try {
      const { reason } = taskReasonSchema.parse(req.body);
      const data = await TaskService.cancelTask(paramId(req), req.user!.userId, reason);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  static async releaseTask(req: Request, res: Response, next: NextFunction) {
    try {
      const { reason } = taskReasonSchema.parse(req.body);
      const data = await TaskService.releaseTask(paramId(req), req.user!.userId, reason);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  static async requestRevision(req: Request, res: Response, next: NextFunction) {
    try {
      const { reason } = taskReasonSchema.parse(req.body);
      const data = await TaskService.requestRevision(paramId(req), req.user!.userId, reason);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  static async getPhoto(req: Request, res: Response, next: NextFunction) {
    try {
      const photo = await TaskService.getPhoto(paramId(req), String(req.params.photoId), req.user!.userId);
      res.setHeader("Cache-Control", "private, no-store");
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.type(photo.contentType).send(Buffer.from(photo.data));
    } catch (error) { next(error); }
  }

  static async getLocation(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await TaskService.getLatestLocation(paramId(req), req.user!.userId);
      res.setHeader("Cache-Control", "private, no-store");
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  static async getEvidence(req: Request, res: Response, next: NextFunction) {
    try {
      const evidence = await TaskService.getEvidence(paramId(req), req.user!.userId);
      res.setHeader("Cache-Control", "private, no-store");
      res.setHeader("X-Content-Type-Options", "nosniff");
      if (evidence.data && evidence.contentType) {
        res.type(evidence.contentType).send(Buffer.from(evidence.data));
      } else if (evidence.path) {
        res.sendFile(evidence.path, (error) => { if (error) next(error); });
      }
    } catch (error) { next(error); }
  }

  static async updateLocation(req: Request, res: Response, next: NextFunction) {
    try {
      const input = locationUpdateSchema.parse({
        ...req.body,
        taskId: paramId(req),
      });
      const data = await LocationService.recordLocation(
        req.user!.userId,
        input
      );
      res.status(202).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async createTask(req: Request, res: Response, next: NextFunction) {
    try {
      const input = createTaskSchema.parse(req.body);
      const task = await TaskService.createTask(req.user!.userId, input);
      res.status(201).json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  }

  static async resolveUrl(req: Request, res: Response, next: NextFunction) {
    try {
      const { url } = req.body;
      if (!url || typeof url !== "string") {
        throw ApiError.badRequest("A valid URL string is required");
      }
      const coords = await resolveGoogleMapsUrl(url);
      res.status(200).json({ success: true, data: coords });
    } catch (error) {
      next(error);
    }
  }

  static async getTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const query = taskQuerySchema.parse(req.query);
      const location =
        query.latitude !== undefined && query.longitude !== undefined
          ? { latitude: query.latitude, longitude: query.longitude }
          : undefined;

      const tasks = await TaskService.getTasks(
        req.user!.userId,
        req.user!.role,
        query.filter,
        location
      );
      res.status(200).json({ success: true, data: tasks });
    } catch (error) {
      next(error);
    }
  }

  static async getTaskById(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await TaskService.getTaskById(
        paramId(req),
        req.user!.userId,
        req.user!.role
      );
      res.status(200).json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  }

  static async acceptTask(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await TaskService.acceptTask(
        paramId(req),
        req.user!.userId
      );

      res.status(200).json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  }

  static async startTask(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await TaskService.startTask(
        paramId(req),
        req.user!.userId
      );

      res.status(200).json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  }

  static async submitTask(req: Request, res: Response, next: NextFunction) {
    try {
      const files = req.files as Record<string, Express.Multer.File[]>;
      const image = files?.image?.[0];
      if (!image) {
        throw ApiError.badRequest("Evidence image is required");
      }

      const input = submitTaskSchema.parse(req.body);
      const imagePath = `/api/tasks/${paramId(req)}/evidence`;

      const task = await TaskService.submitTask(
        paramId(req),
        req.user!.userId,
        input,
        imagePath,
        { data: image.buffer, contentType: image.mimetype },
        (files.photos ?? []).map((file) => ({ data: file.buffer, contentType: file.mimetype, filename: file.originalname }))
      );

      res.status(200).json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  }

  static async completeTask(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await TaskService.completeTask(
        paramId(req),
        req.user!.userId
      );

      res.status(200).json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  }
}
