import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthContainer } from "./modules/auth/container";
import { StationContainer } from "./modules/station/container";

export class AppRoutes {
  private router: Router;
  private authRoutes: AuthContainer;
  private stationRoutes: StationContainer;

  constructor(
    _prisma: PrismaClient,
    authContainer: AuthContainer,
    stationContainer: StationContainer,
  ) {
    this.router = Router();
    this.authRoutes = authContainer;
    this.stationRoutes = stationContainer;

    this.initializeRoutes();
  }

  public initializeRoutes(): void {
    this.router.use("/auth", this.authRoutes.routes.getRouter());
    this.router.use("/stations", this.stationRoutes.routes.getRouter());
  }

  public getRouter(): Router {
    return this.router;
  }
}
