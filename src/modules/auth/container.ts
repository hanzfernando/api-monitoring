import { PrismaClient } from "@prisma/client";
import { AuthController } from "./controller";
import { AuthRepository } from "./repository";
import { AuthRoutes } from "./route";
import { AuthService } from "./service";

/**
 * Dependency injection container for authentication module
 * Manages initialization and wiring of auth components
 */
export class AuthContainer {
  public readonly repository: AuthRepository;
  public readonly service: AuthService;
  public readonly controller: AuthController;
  public readonly routes: AuthRoutes;

  /**
   * Initialize auth container with database connection
   * Sets up dependency chain: repository -> service -> controller -> routes
   */
  constructor(prisma: PrismaClient) {
    this.repository = new AuthRepository(prisma);
    this.service = new AuthService(this.repository);
    this.controller = new AuthController(this.service);
    this.routes = new AuthRoutes(this.controller);
  }
}
