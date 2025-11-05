import { Router } from "express";
import { MonitorController } from "./controller";
import { protect } from "../../core/middlewares/auth.middleware";

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
    this.router.get("/:id", protect, this.controller.get.bind(this.controller));
    this.router.delete("/:id", protect, this.controller.remove.bind(this.controller));
  }

  public getRouter() {
    return this.router;
  }
}
