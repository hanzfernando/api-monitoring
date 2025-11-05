import { PrismaClient } from "@prisma/client";
import { StationController } from "./controller";
import { StationRepository } from "./repository";
import { StationRoutes } from "./route";
import { StationService } from "./service";

export class StationContainer {
  public readonly repository: StationRepository;
  public readonly service: StationService;
  public readonly controller: StationController;
  public readonly routes: StationRoutes;

  constructor(prisma: PrismaClient) {
    this.repository = new StationRepository(prisma);
    this.service = new StationService(this.repository);
    this.controller = new StationController(this.service);
    this.routes = new StationRoutes(this.controller);
  }
}
