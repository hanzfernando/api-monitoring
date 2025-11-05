import type { Request, Response } from "express";
import type { AuthService } from "./service";

export class AuthController {
  private service: AuthService;

  constructor(service: AuthService) {
    this.service = service;
  }

  async login(req: Request, res: Response) {
    try {
      const { name, password } = req.body ?? {};
      if (!name || !password) {
        return res.status(400).json({ error: "name and password required" });
      }

      const result = await this.service.login(name, password);
      
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(401).json({ error: error.message ?? "Unauthorized" });
    }
  }

  async register(req: Request, res: Response) {
    try {
      const { name, password } = req.body ?? {};
      if (!name || !password) {
        return res.status(400).json({ error: "name and password required" });
      }
      const result = await this.service.register(name, password);
      return res.status(201).json(result);
    } catch (error: any) {
      return res.status(500).json({ error: error.message ?? "Internal Server Error" });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      await this.service.logout();
      return res.status(200).json({ message: "Logged out successfully" });
    } catch (error: any) {
      return res.status(500).json({ error: error.message ?? "Internal Server Error" });
    }
  }
}
