import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const submitTaskSchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  accuracy: z.coerce.number().min(0).max(100_000).optional(),
  capturedAt: z.string().datetime({ offset: true }).optional(),
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
export type SubmitTaskInput = z.infer<typeof submitTaskSchema>;
export type TaskQueryInput = z.infer<typeof taskQuerySchema>;

