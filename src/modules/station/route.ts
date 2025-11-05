import { Router } from "express";
import { StationController } from "./controller";
import { protect } from "../../core/middlewares/auth.middleware";

export class StationRoutes {
  private router: Router;
  private controller: StationController;

  constructor(controller: StationController) {
    this.router = Router();
    this.controller = controller;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post("/", protect, this.controller.create.bind(this.controller));
    this.router.get("/", protect, this.controller.list.bind(this.controller));
    this.router.get("/:id", protect, this.controller.get.bind(this.controller));
    this.router.put("/:id", protect, this.controller.update.bind(this.controller));
    this.router.delete("/:id", protect, this.controller.remove.bind(this.controller));
  }

  public getRouter() {
    return this.router;
  }
}
