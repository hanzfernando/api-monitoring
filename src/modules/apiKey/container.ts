import { PrismaClient } from "@prisma/client";
import { ApiKeyController } from "./controller";
import { ApiKeyRepository } from "./repository";
import { ApiKeyRoutes } from "./route";
import { ApiKeyService } from "./service";

export class ApiKeyContainer {
  public readonly repository: ApiKeyRepository;
  public readonly service: ApiKeyService;
  public readonly controller: ApiKeyController;
  public readonly routes: ApiKeyRoutes;

  constructor(prisma: PrismaClient) {
    this.repository = new ApiKeyRepository(prisma);
    this.service = new ApiKeyService(this.repository);
    this.controller = new ApiKeyController(this.service);
    this.routes = new ApiKeyRoutes(this.controller);
  }
}
