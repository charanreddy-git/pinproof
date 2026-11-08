import multer from "multer";
import path from "path";
import { ApiError } from "../utils";

const storage = multer.memoryStorage();

const ALLOWED_TYPES = ["image/jpeg", "image/png"];
const ALLOWED_EXTS = [".jpg", ".jpeg", ".png"];
// Leave room for multipart fields beneath Vercel's 4.5 MB request limit.
const MAX_SIZE = 4 * 1024 * 1024;

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_TYPES.includes(file.mimetype) && ALLOWED_EXTS.includes(ext)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, "Only JPG, JPEG, and PNG files are allowed"));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_SIZE,
  },
});
