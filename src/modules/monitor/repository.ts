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
  }) {
    const data: any = {
      endpoint: log.endpoint,
      method: log.method,
      statusCode: log.statusCode,
    };

    if (log.userId !== undefined && log.userId !== null) {
      data.userId = log.userId;
    }

    if (log.responseTime !== undefined && log.responseTime !== null) {
      data.responseTime = log.responseTime;
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

  async delete(id: number) {
    return this.prisma.apiLog.delete({ where: { id } });
  }
}
