import { PrismaClient } from "@prisma/client";
import { ApiLog } from "./type";

export class MonitorRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async create(log: {
    endpoint: string;
    method: string;
    statusCode: number;
    userId?: string | null;
    responseTime?: number | null;
    apiKeyId?: number | null;
    apiKeyValue?: string | null;
  }) {
    const data: any = {
      endpoint: log.endpoint,
      method: log.method,
      statusCode: log.statusCode,
      apiKeyValue: log.apiKeyValue ?? "",
    };

    if (log.userId !== undefined && log.userId !== null) {
      data.userId = log.userId;
    }

    if (log.responseTime !== undefined && log.responseTime !== null) {
      data.responseTime = log.responseTime;
    }

    if (log.apiKeyId !== undefined && log.apiKeyId !== null) {
      data.apiKeyId = log.apiKeyId;
    }

    return await this.prisma.apiLog.create({ data });
  }

  async findAll(filter?: { userId?: string; endpoint?: string; statusCode?: number }) {
    const where: any = {};
    if (filter) {
      if (filter.userId) where.userId = filter.userId;
      if (filter.endpoint) where.endpoint = { contains: filter.endpoint };
      if (filter.statusCode) where.statusCode = filter.statusCode;
    }
    return this.prisma.apiLog.findMany({ where, orderBy: { createdAt: "desc" } });
  }

  async findById(id: number) {
    return this.prisma.apiLog.findUnique({ where: { id } });
  }

  async findByApiKeyId(apiKeyId: number, userId: string) {
    // return logs for an apiKeyId but ensure ownership: either the log.userId matches
    // or the related apiKey belongs to the same user.
    const where: any = { apiKeyId };
    where.AND = [
      {
        OR: [{ userId: userId }, { apiKey: { userId: userId } }],
      },
    ];

    return this.prisma.apiLog.findMany({ where, orderBy: { createdAt: "desc" } });
  }

  async delete(id: number) {
    return this.prisma.apiLog.delete({ where: { id } });
  }
}
