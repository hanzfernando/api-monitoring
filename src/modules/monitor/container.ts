import { PrismaClient } from "@prisma/client";
import { MonitorController } from "./controller";
import { MonitorRepository } from "./repository";
import { MonitorRoutes } from "./route";
import { MonitorService } from "./service";
import { createMonitorMiddleware } from "./middleware";
import { createApiKeyMonitorMiddleware } from "./apiKeyMonitor.middleware";

export class MonitorContainer {
  public readonly repository: MonitorRepository;
  public readonly service: MonitorService;
  public readonly controller: MonitorController;
  public readonly routes: MonitorRoutes;
  public readonly middleware: ReturnType<typeof createMonitorMiddleware>;
  public readonly apiKeyMiddleware: ReturnType<typeof createApiKeyMonitorMiddleware>;

  constructor(prisma: PrismaClient) {
    this.repository = new MonitorRepository(prisma);
    this.service = new MonitorService(this.repository);
    this.controller = new MonitorController(this.service);
    this.routes = new MonitorRoutes(this.controller);
    this.middleware = createMonitorMiddleware(this.repository);
    this.apiKeyMiddleware = createApiKeyMonitorMiddleware(this.repository);
  }
}
