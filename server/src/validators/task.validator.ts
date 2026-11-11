import { z } from "zod";

export const createTaskSchema = z.object({
  visitPlan: z.enum(["STANDARD", "DETAILED"]).default("STANDARD"),
  propertyType: z.string().trim().max(80).optional(),
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(160),
  description: z.string().trim().min(10, "Description must be at least 10 characters").max(5000),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const updateTaskSchema = createTaskSchema.pick({
  title: true, description: true, latitude: true, longitude: true,
});

export const taskReasonSchema = z.object({
  reason: z.string().trim().min(10, "Please add at least 10 characters of detail").max(2000),
});

const coordinate = (min: number, max: number) => z.preprocess(
  (value) => value === "" || value === null ? undefined : value,
  z.coerce.number().min(min).max(max),
);

export const submitTaskSchema = z.object({
  latitude: coordinate(-90, 90),
  longitude: coordinate(-180, 180),
  accuracy: coordinate(0, 100_000).optional(),
  evidenceSource: z.enum(["CAMERA", "UPLOAD"]).default("UPLOAD"),
  capturedAt: z.string().datetime({ offset: true }).optional(),
  inspectorNotes: z.string().trim().max(5000).optional(),
});

export const taskQuerySchema = z
  .object({
    filter: z.enum(["available", "accepted"]).optional(),
    latitude: z.coerce.number().min(-90).max(90).optional(),
    longitude: z.coerce.number().min(-180).max(180).optional(),
  })
  .refine(
    (query) =>
      (query.latitude === undefined) === (query.longitude === undefined),
    {
      message: "latitude and longitude must be provided together",
      path: ["latitude"],
    }
  );

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type SubmitTaskInput = z.infer<typeof submitTaskSchema>;
export type TaskQueryInput = z.infer<typeof taskQuerySchema>;
