import { z } from "zod";

const roleSchema = z.enum(["USER", "CAPTAIN"], {
  error: "Role must be USER or CAPTAIN",
});

const nameSchema = z
  .string()
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(80, "Name is too long");

const phoneSchema = z
  .string()
  .trim()
  .min(5, "Enter your mobile number")
  .max(30, "Mobile number is too long");

export const requestOtpSchema = z.object({
  phone: phoneSchema,
});

export const verifyOtpSchema = z.object({
  phone: phoneSchema,
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter the 6-digit code"),
  name: nameSchema.optional(),
  role: roleSchema.optional(),
});

export type RequestOtpInput = z.infer<typeof requestOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;

export const profileSchema = z.object({
  name: nameSchema,
  email: z.union([z.email().max(254), z.literal("")]).nullish(),
});
export type ProfileInput = z.infer<typeof profileSchema>;

export const demoLoginSchema = z.object({
  role: roleSchema,
});

export type DemoLoginInput = z.infer<typeof demoLoginSchema>;
