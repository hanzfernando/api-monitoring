import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthContainer } from "./modules/auth/container";

export class AppRoutes {
  private router: Router;
  private authRoutes: AuthContainer;

  constructor(
    _prisma: PrismaClient,
    authContainer: AuthContainer,
  ) {
    this.router = Router();
    this.authRoutes = authContainer;

    this.initializeRoutes();
  }

  public initializeRoutes(): void {
    this.router.use("/auth", this.authRoutes.routes.getRouter());
  }

  public getRouter(): Router {
    return this.router;
  }
}
