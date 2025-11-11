import { Router } from "express";
import { StationController } from "./controller";
import { eitherAuth } from "../../middleware/compositeAuth.middleware";

export class StationRoutes {
  private router: Router;
  private controller: StationController;

  constructor(controller: StationController) {
    this.router = Router();
    this.controller = controller;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
  this.router.post("/", eitherAuth, this.controller.create.bind(this.controller));
  this.router.get("/", eitherAuth, this.controller.list.bind(this.controller));
  this.router.get("/:id", eitherAuth, this.controller.get.bind(this.controller));
  this.router.put("/:id", eitherAuth, this.controller.update.bind(this.controller));
  this.router.delete("/:id", eitherAuth, this.controller.remove.bind(this.controller));
  }

  public getRouter() {
    return this.router;
  }
}
