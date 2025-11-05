import { Router } from "express";
import { ApiKeyController } from "./controller";
import { protect } from "../../core/middlewares/auth.middleware";

export class ApiKeyRoutes {
  private router: Router;
  private controller: ApiKeyController;

  constructor(controller: ApiKeyController) {
    this.router = Router();
    this.controller = controller;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post("/", this.controller.create.bind(this.controller));
    this.router.get("/", this.controller.list.bind(this.controller));
    this.router.get("/:id", this.controller.get.bind(this.controller));
    this.router.delete("/:id", this.controller.remove.bind(this.controller));
  }

  public getRouter() {
    return this.router;
  }
}
