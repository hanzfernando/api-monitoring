import type { Request, Response } from "express";
import type { StationService } from "./service";

export class StationController {
  private service: StationService;

  constructor(service: StationService) {
    this.service = service;
  }

  async create(req: Request, res: Response) {
    try {
      const { name, location } = req.body ?? {};
      if (!name || !location) return res.status(400).json({ error: "name and location required" });

      const station = await this.service.create(name, location);
      return res.status(201).json(station);
    } catch (err: any) {
      return res.status(500).json({ error: err.message ?? "Internal Server Error" });
    }
  }

  async list(req: Request, res: Response) {
    try {
      const stations = await this.service.list();
      return res.status(200).json(stations);
    } catch (err: any) {
      return res.status(500).json({ error: err.message ?? "Internal Server Error" });
    }
  }

  async get(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) return res.status(400).json({ error: "invalid id" });

      const station = await this.service.get(id);
      return res.status(200).json(station);
    } catch (err: any) {
      return res.status(404).json({ error: err.message ?? "Not Found" });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) return res.status(400).json({ error: "invalid id" });

      const { name, location } = req.body ?? {};
      if (!name && !location) return res.status(400).json({ error: "nothing to update" });

      const updated = await this.service.update(id, { name, location });
      return res.status(200).json(updated);
    } catch (err: any) {
      return res.status(500).json({ error: err.message ?? "Internal Server Error" });
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
