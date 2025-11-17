import { Router } from "express";
import { MonitorController } from "./controller";
import { protect } from "../../middleware/auth.jwt.middleware";

export class MonitorRoutes {
  private router: Router;
  private controller: MonitorController;

  constructor(controller: MonitorController) {
    this.router = Router();
    this.controller = controller;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get("/", protect, this.controller.list.bind(this.controller));
    this.router.get("/combined-history", protect, this.controller.getCombinedHistoryForUser.bind(this.controller));
    this.router.get("/:apiKeyId", protect, this.controller.listByApiKeyId.bind(this.controller));
    this.router.get("/:apiKeyId/average-response-time", protect, this.controller.getAverageResponseTime.bind(this.controller));
    this.router.get("/:apiKeyId/requests-per-hour", protect, this.controller.getPastHourRequestCount.bind(this.controller));
    this.router.get("/:apiKeyId/request-history", protect, this.controller.getRequestHistory.bind(this.controller));
    this.router.get("/:apiKeyId/response-history", protect, this.controller.getResponseHistory.bind(this.controller));
    this.router.get("/:apiKeyId/combined-history", protect, this.controller.getCombinedHistory.bind(this.controller));
  }

  public getRouter() {
    return this.router;
  }
}
