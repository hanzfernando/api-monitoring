import { PrismaClient } from "@prisma/client";

export class ApiKeyRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async create(data: { key: string; userId: string }) {
    // allow optional expiresAt in data
    const { key, userId, expiresAt } = data as { key: string; userId: string; expiresAt?: Date | null };
    const createData: any = { key, userId };
    if (expiresAt !== undefined) createData.expiresAt = expiresAt;
    return this.prisma.apiKey.create({ data: createData });
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
