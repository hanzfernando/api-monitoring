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
    this.router.get("/:apiKeyId", protect, this.controller.listByApiKeyId.bind(this.controller));
    this.router.delete("/:apiKeyId", protect, this.controller.remove.bind(this.controller));
  }

  public getRouter() {
    return this.router;
  }
}
