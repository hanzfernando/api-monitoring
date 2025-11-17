import type { Request, Response } from "express";
import type { MonitorService } from "./service";

export class MonitorController {
  private service: MonitorService;

  constructor(service: MonitorService) {
    this.service = service;
  }

  async list(req: Request, res: Response) {
    try {
      // enforce authenticated user
      const authUser = (req as any).user;
      if (!authUser || !authUser.id) return res.status(401).json({ error: "Unauthorized" });

      const { endpoint, statusCode } = req.query as any;
      const filter: any = { userId: String(authUser.id) };
      if (endpoint) filter.endpoint = String(endpoint);
      if (statusCode) filter.statusCode = Number(statusCode);

      const logs = await this.service.list(filter);
      return res.status(200).json(logs);
    } catch (err: any) {
      return res.status(500).json({ error: err.message ?? "Internal Server Error" });
    }
  }

  async listByApiKeyId(req: Request, res: Response) {
    try {
      // scoped to the authenticated user.
      const apiKeyId = Number(req.params.apiKeyId);
      if (Number.isNaN(apiKeyId)) return res.status(400).json({ error: "invalid apiKeyId" });

      const authUser = (req as any).user;
      if (!authUser || !authUser.id) return res.status(401).json({ error: "Unauthorized" });

      const logs = await this.service.listByApiKeyId(apiKeyId, String(authUser.id));
      return res.status(200).json(logs);
    } catch (err: any) {
      return res.status(404).json({ error: err.message ?? "Not Found" });
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const id = Number(req.params.apiKeyId);
      if (Number.isNaN(id)) return res.status(400).json({ error: "invalid id" });

      const authUser = (req as any).user;
      if (!authUser || !authUser.id) return res.status(401).json({ error: "Unauthorized" });

      // fetch and verify ownership before deleting
      const log = await this.service.get(id);
      if (!log) return res.status(404).json({ error: "Log not found" });
      if (log.userId === null || String(log.userId) !== String(authUser.id)) {
        return res.status(403).json({ error: "Forbidden" });
      }

      await this.service.remove(id);
      return res.status(200).json({ message: "deleted" });
    } catch (err: any) {
      return res.status(500).json({ error: err.message ?? "Internal Server Error" });
    }
  }

  async getAverageResponseTime(req: Request, res: Response) {
    try {
      const apiKeyId = Number(req.params.apiKeyId);
      if (Number.isNaN(apiKeyId)) return res.status(400).json({ error: "invalid apiKeyId" });

      const authUser = (req as any).user;
      if (!authUser || !authUser.id) return res.status(401).json({ error: "Unauthorized" });

      const averageResponseTime = await this.service.getAverageResponseTime(apiKeyId);
      return res.status(200).json({ averageResponseTime });
    } catch (err: any) {
      return res.status(500).json({ error: err.message ?? "Internal Server Error" });
    }
  }

  async getPastHourRequestCount(req: Request, res: Response) {
    try {
      const apiKeyId = Number(req.params.apiKeyId);
      if (Number.isNaN(apiKeyId)) return res.status(400).json({ error: "invalid apiKeyId" });

      const authUser = (req as any).user;
      if (!authUser || !authUser.id) return res.status(401).json({ error: "Unauthorized" });

      const count = await this.service.getPastHourRequestCount(apiKeyId);
      return res.status(200).json({ count });
    } catch (err: any) {
      return res.status(500).json({ error: err.message ?? "Internal Server Error" });
    }
  }

  async getRequestHistory(req: Request, res: Response) {
    try {
      const apiKeyId = Number(req.params.apiKeyId);
      if (Number.isNaN(apiKeyId)) return res.status(400).json({ error: "invalid apiKeyId" });
      const { since, interval } = req.query as any;
      // allow period strings like 'pastHour','pastDay','past7Days' OR an ISO date string
      const allowedPeriods = ["pastHour", "pastDay", "past7Days", "pastWeek", "pastMonth"];
      if (!since) return res.status(400).json({ error: "invalid since parameter" });
      const sinceStr = String(since);
      const isPeriod = allowedPeriods.includes(sinceStr);
      const parsedDate = new Date(sinceStr);
      const isValidDate = !isNaN(parsedDate.getTime());
      if (!isPeriod && !isValidDate) {
        return res.status(400).json({ error: "invalid since parameter" });
      }
      if (interval !== "hourly" && interval !== "daily") {
        return res.status(400).json({ error: "invalid interval parameter" });
      }
      const authUser = (req as any).user;
      if (!authUser || !authUser.id) return res.status(401).json({ error: "Unauthorized" });
      const sinceParam = isPeriod ? sinceStr : parsedDate;
      const history = await this.service.getRequestHistory(apiKeyId, sinceParam as any, interval);
      return res.status(200).json(history);
    } catch (err: any) {
      return res.status(500).json({ error: err.message ?? "Internal Server Error" });
    }
  }

  async getResponseHistory(req: Request, res: Response) {
    try {
      const apiKeyId = Number(req.params.apiKeyId);
      if (Number.isNaN(apiKeyId)) return res.status(400).json({ error: "invalid apiKeyId" });
      const { since, interval } = req.query as any;
      const allowedPeriods = ["pastHour", "pastDay", "past7Days", "pastWeek", "pastMonth"];
      if (!since) return res.status(400).json({ error: "invalid since parameter" });
      const sinceStr = String(since);
      const isPeriod = allowedPeriods.includes(sinceStr);
      const parsedDate = new Date(sinceStr);
      const isValidDate = !isNaN(parsedDate.getTime());
      if (!isPeriod && !isValidDate) {
        return res.status(400).json({ error: "invalid since parameter" });
      }
      if (interval !== "hourly" && interval !== "daily") {
        return res.status(400).json({ error: "invalid interval parameter" });
      }
      const authUser = (req as any).user;
      if (!authUser || !authUser.id) return res.status(401).json({ error: "Unauthorized" });
      const sinceParam = isPeriod ? sinceStr : parsedDate;
      const history = await this.service.getResponseHistory(apiKeyId, sinceParam as any, interval);
      return res.status(200).json(history);
    } catch (err: any) {
      return res.status(500).json({ error: err.message ?? "Internal Server Error" });
    }
  }
}