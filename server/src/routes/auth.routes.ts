import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { AuthController } from "../controllers";
import { authenticate } from "../middleware";

const router = Router();

const requestLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 15,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many code requests from this connection. Try again later.",
  },
});

const verifyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many verification attempts. Try again later.",
  },
});

// A public demo offers only the two prepared accounts, never console OTPs.
router.use("/otp", (_req, res, next) => {
  if (process.env.PUBLIC_DEMO === "true") {
    res.status(403).json({ success: false, message: "Phone sign-in is unavailable in this demo. Choose Try the demo above." });
    return;
  }
  next();
});
router.post("/otp/request", requestLimiter, AuthController.requestOtp);
router.post("/otp/verify", verifyLimiter, AuthController.verifyOtp);

// Explicit demo access. DemoService re-checks AUTH_MODE and PUBLIC_DEMO on every request.
const demoLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 60,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many demo requests. Try again in a few minutes.",
  },
});

router.get("/mode", AuthController.getMode);
router.get("/me", authenticate, AuthController.getProfile);
router.patch("/me", authenticate, AuthController.updateProfile);
router.post("/demo", demoLimiter, AuthController.demoLogin);
router.post("/demo/reset", demoLimiter, AuthController.resetDemo);

export default router;
