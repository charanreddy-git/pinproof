import { Router } from "express";
import { TaskController } from "../controllers";
import { authenticate, authorize, upload } from "../middleware";
import { validateProofFiles } from "../middleware/upload.middleware";

const router = Router();

// All routes require authentication
router.use(authenticate);
router.use((_req, res, next) => { res.setHeader("Cache-Control", "private, no-store"); next(); });

// Resolve Google Maps URL (USER only)
router.post("/resolve-url", authorize(["USER"]), TaskController.resolveUrl);

// Create task (USER only)
router.post("/", authorize(["USER"]), TaskController.createTask);

// Get tasks (filtered by role automatically)
router.get("/", TaskController.getTasks);

router.get("/:id/location", TaskController.getLocation);

// Share a live GPS point (CAPTAIN only)
router.post(
  "/:id/location",
  authorize(["CAPTAIN"]),
  TaskController.updateLocation
);

router.get("/:id/evidence", TaskController.getEvidence);
router.get("/:id/photos/:photoId", TaskController.getPhoto);
router.patch("/:id", authorize(["USER"]), TaskController.updateTask);
router.post("/:id/cancel", authorize(["USER"]), TaskController.cancelTask);
router.post("/:id/release", authorize(["CAPTAIN"]), TaskController.releaseTask);
router.post("/:id/revision", authorize(["USER"]), TaskController.requestRevision);

// Get single task
router.get("/:id", TaskController.getTaskById);

// Accept task (CAPTAIN only)
router.post("/:id/accept", authorize(["CAPTAIN"]), TaskController.acceptTask);

// Start task (CAPTAIN only)
router.post("/:id/start", authorize(["CAPTAIN"]), TaskController.startTask);

// Submit evidence (CAPTAIN only, with file upload)
router.post(
  "/:id/submit",
  authorize(["CAPTAIN"]),
  upload.fields([{ name: "image", maxCount: 1 }, { name: "photos", maxCount: 5 }]),
  validateProofFiles,
  TaskController.submitTask
);

// Complete task (USER only)
router.post("/:id/complete", authorize(["USER"]), TaskController.completeTask);

export default router;
