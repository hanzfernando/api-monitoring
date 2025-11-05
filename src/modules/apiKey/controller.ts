import type { Request, Response } from "express";
import type { ApiKeyService } from "./service";
import type { ApiKey } from "./type";

export class ApiKeyController {
  private service: ApiKeyService;

  constructor(service: ApiKeyService) {
    this.service = service;
  }

  async create(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      if (!user) return res.status(401).json({ error: "Unauthorized" });

  const apiKey = await this.service.create(user.id);
  return res.status(201).json(apiKey as ApiKey);
    } catch (err: any) {
      return res.status(500).json({ error: err.message ?? "Internal Server Error" });
    }
  }

  async list(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      // default to returning only keys for the authenticated user
      const userId = user ? user.id : undefined;
  const keys = await this.service.list(userId);
  return res.status(200).json(keys as ApiKey[]);
    } catch (err: any) {
      return res.status(500).json({ error: err.message ?? "Internal Server Error" });
    }
  }

  async get(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) return res.status(400).json({ error: "invalid id" });

  const key = await this.service.get(id);
  return res.status(200).json(key as ApiKey);
    } catch (err: any) {
      return res.status(404).json({ error: err.message ?? "Not Found" });
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) return res.status(400).json({ error: "invalid id" });

      const user = (req as any).user;
      if (!user) return res.status(401).json({ error: "Unauthorized" });

      await this.service.remove(id, user.id);
      return res.status(200).json({ message: "deleted" });
    } catch (err: any) {
      return res.status(403).json({ error: err.message ?? "Forbidden" });
    }
  }
}
