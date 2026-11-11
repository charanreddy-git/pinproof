import { Request, Response, NextFunction } from "express";
import { AuthService, DemoService } from "../services";
import {
  demoLoginSchema,
  requestOtpSchema,
  verifyOtpSchema,
  profileSchema,
} from "../validators";

export class AuthController {
  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      res.setHeader("Cache-Control", "private, no-store");
      res.json({ success: true, data: await AuthService.getProfile(req.user!.userId) });
    } catch (error) { next(error); }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      res.setHeader("Cache-Control", "private, no-store");
      res.json({ success: true, data: await AuthService.updateProfile(req.user!.userId, profileSchema.parse(req.body)) });
    } catch (error) { next(error); }
  }

  static async getMode(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = await DemoService.getMode();
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async demoLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const input = demoLoginSchema.parse(req.body);
      const result = await DemoService.login(input.role);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async resetDemo(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = await DemoService.reset();
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async requestOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const input = requestOtpSchema.parse(req.body);
      const result = await AuthService.requestOtp(input);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const input = verifyOtpSchema.parse(req.body);
      const result = await AuthService.verifyOtp(input);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
