import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthContainer } from "./modules/auth/container";
import { StationContainer } from "./modules/station/container";
import { MonitorContainer } from "./modules/monitor/container";
import { ApiKeyContainer } from "./modules/apiKey/container";
import { eitherAuth } from "./core/middlewares/compositeAuth.middleware";

export class AppRoutes {
  private router: Router;
  private authRoutes: AuthContainer;
  private stationRoutes: StationContainer;
  private monitorRoutes?: MonitorContainer;
  private apiKeyRoutes?: ApiKeyContainer;

  constructor(
    _prisma: PrismaClient,
    authContainer: AuthContainer,
    stationContainer: StationContainer,
    monitorContainer?: MonitorContainer,
    apiKeyContainer?: ApiKeyContainer,
  ) {
    this.router = Router();
    this.authRoutes = authContainer;
    this.stationRoutes = stationContainer;
    this.monitorRoutes = monitorContainer;
  this.apiKeyRoutes = apiKeyContainer;

    this.initializeRoutes();
  }

  public initializeRoutes(): void {
    this.router.use("/auth", this.authRoutes.routes.getRouter());
    this.router.use("/stations", eitherAuth, this.stationRoutes.routes.getRouter());
    if (this.monitorRoutes) {
      this.router.use("/monitor", eitherAuth, this.monitorRoutes.routes.getRouter());
    }
    if (this.apiKeyRoutes) {
      this.router.use("/api-keys", eitherAuth, this.apiKeyRoutes.routes.getRouter());
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}
