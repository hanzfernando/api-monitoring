import { PrismaClient } from "@prisma/client";

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
    return this.prisma.apiLog.create({ data: log });
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
