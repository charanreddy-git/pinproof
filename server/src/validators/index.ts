export {
  demoLoginSchema,
  requestOtpSchema,
  verifyOtpSchema,
} from "./auth.validator";
export type {
  DemoLoginInput,
  RequestOtpInput,
  VerifyOtpInput,
} from "./auth.validator";
export {
  createTaskSchema,
  submitTaskSchema,
  taskQuerySchema,
} from "./task.validator";
export type {
  CreateTaskInput,
  SubmitTaskInput,
  TaskQueryInput,
} from "./task.validator";
export { locationUpdateSchema } from "./location.validator";
export type { LocationUpdateInput } from "./location.validator";
