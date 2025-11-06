import { PrismaClient } from "@prisma/client";
import { MonitorController } from "./controller";
import { MonitorRepository } from "./repository";
import { MonitorRoutes } from "./route";
import { MonitorService } from "./service";
// Monitoring middleware relocated to src/middleware/monitor.middleware.ts

export class MonitorContainer {
  public readonly repository: MonitorRepository;
  public readonly service: MonitorService;
  public readonly controller: MonitorController;
  public readonly routes: MonitorRoutes;
  // middleware responsibilities removed from container to avoid DI for middleware

  constructor(prisma: PrismaClient) {
    this.repository = new MonitorRepository(prisma);
    this.service = new MonitorService(this.repository);
    this.controller = new MonitorController(this.service);
    this.routes = new MonitorRoutes(this.controller);
  // middleware is now registered centrally (see src/middleware/monitor.middleware.ts)
  }
}
