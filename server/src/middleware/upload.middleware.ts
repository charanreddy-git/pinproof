import multer from "multer";
import path from "path";
import { ApiError } from "../utils";
import type { RequestHandler } from "express";

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
    files: 6,
    fields: 10,
    fieldSize: 16 * 1024,
  },
});

export const validateProofFiles: RequestHandler = (req, _res, next) => {
  const fields = req.files as Record<string, Express.Multer.File[]> | undefined;
  const files = Object.values(fields ?? {}).flat();
  if (files.reduce((total, file) => total + file.size, 0) > MAX_SIZE) {
    next(ApiError.badRequest("Keep all photos together under 4 MB. Choose smaller photos."));
    return;
  }
  for (const file of files) {
    const png = file.buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    const jpeg = file.buffer[0] === 0xff && file.buffer[1] === 0xd8 && file.buffer[2] === 0xff;
    if (!(file.mimetype === "image/png" ? png : jpeg)) {
      next(ApiError.badRequest("This file is not a valid JPG or PNG photo."));
      return;
    }
  }
  next();
};
