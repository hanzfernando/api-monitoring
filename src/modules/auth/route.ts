import { Router } from "express";
import { AuthController } from "./controller";

/**
 * Authentication route definitions
 * Handles login, logout, profile access, and password reset endpoints
 */
export class AuthRoutes {
  private router: Router;
  private controller: AuthController;

  constructor(authController: AuthController) {
    this.router = Router();
    this.controller = authController;
    this.initializeRoutes();
  }

  /**
   * Sets up all authentication routes with appropriate middleware
   */
  private initializeRoutes(): void {
    this.router.post(
      "/login",
      this.controller.login.bind(this.controller)
    );

    this.router.post("/logout", this.controller.logout.bind(this.controller));
    this.router.post(
      "/register",
      this.controller.register.bind(this.controller)
    );
  }

  /**
   * Returns configured Express router
   */
  public getRouter(): Router {
    return this.router;
  }
}
