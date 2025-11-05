import { PrismaClient } from "@prisma/client";

export class ApiKeyRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async create(data: { key: string; userId: string }) {
    return this.prisma.apiKey.create({ data });
  }

  async findAll(filter?: { userId?: string }) {
    const where: any = {};
    if (filter?.userId) where.userId = filter.userId;
    return this.prisma.apiKey.findMany({ where, orderBy: { createdAt: "desc" } });
  }

  async findById(id: number) {
    return this.prisma.apiKey.findUnique({ where: { id } });
  }

  async findByKey(key: string) {
    return this.prisma.apiKey.findUnique({ where: { key } });
  }

  async delete(id: number) {
    return this.prisma.apiKey.delete({ where: { id } });
  }
}
