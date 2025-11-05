import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthContainer } from "./modules/auth/container";
import { StationContainer } from "./modules/station/container";
import { MonitorContainer } from "./modules/monitor/container";

export class AppRoutes {
  private router: Router;
  private authRoutes: AuthContainer;
  private stationRoutes: StationContainer;
  private monitorRoutes?: MonitorContainer;

  constructor(
    _prisma: PrismaClient,
    authContainer: AuthContainer,
    stationContainer: StationContainer,
    monitorContainer?: MonitorContainer,
  ) {
    this.router = Router();
    this.authRoutes = authContainer;
    this.stationRoutes = stationContainer;
    this.monitorRoutes = monitorContainer;

    this.initializeRoutes();
  }

  public initializeRoutes(): void {
    this.router.use("/auth", this.authRoutes.routes.getRouter());
    this.router.use("/stations", this.stationRoutes.routes.getRouter());
    if (this.monitorRoutes) {
      this.router.use("/monitor", this.monitorRoutes.routes.getRouter());
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}
