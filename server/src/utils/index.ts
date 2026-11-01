export { ApiError } from "./api-error";
export { normalizePhone, formatPhone } from "./phone";
export {
  generateOtp,
  hashOtp,
  otpMatches,
  OTP_TTL_SECONDS,
  OTP_RESEND_SECONDS,
  OTP_MAX_SENDS_PER_HOUR,
  OTP_MAX_ATTEMPTS,
} from "./otp";
export {
  CAPTAIN_DISCOVERY_RADIUS_KM,
  haversineDistance,
  MAX_DISTANCE_METERS,
} from "./haversine";
export { signToken, verifyToken } from "./jwt";
export type { JwtPayload } from "./jwt";
export { logger } from "./logger";
export { resolveGoogleMapsUrl } from "./url-resolver";
export {
  DEMO_ACCOUNTS,
  getAuthMode,
  isDemoAuthEnabled,
  requireDemoAuth,
} from "./auth-mode";
export type { AuthMode, DemoRole } from "./auth-mode";
