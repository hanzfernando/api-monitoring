import type { Request, Response } from "express";
import type { MonitorService } from "./service";

export class MonitorController {
  private service: MonitorService;

  constructor(service: MonitorService) {
    this.service = service;
  }

  async list(req: Request, res: Response) {
    try {
      const { userId, endpoint, statusCode } = req.query as any;
      const filter: any = {};
      if (userId) filter.userId = String(userId);
      if (endpoint) filter.endpoint = String(endpoint);
      if (statusCode) filter.statusCode = Number(statusCode);

      const logs = await this.service.list(filter);
      return res.status(200).json(logs);
    } catch (err: any) {
      return res.status(500).json({ error: err.message ?? "Internal Server Error" });
    }
  }

  async get(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) return res.status(400).json({ error: "invalid id" });

      const log = await this.service.get(id);
      return res.status(200).json(log);
    } catch (err: any) {
      return res.status(404).json({ error: err.message ?? "Not Found" });
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) return res.status(400).json({ error: "invalid id" });

      await this.service.remove(id);
      return res.status(200).json({ message: "deleted" });
    } catch (err: any) {
      return res.status(500).json({ error: err.message ?? "Internal Server Error" });
    }
  }
}
