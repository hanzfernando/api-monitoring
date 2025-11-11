import { PrismaClient } from "@prisma/client";

export class ApiKeyRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async create(data: { key: string; userId: string }) {
    // allow optional expiresAt in data
    const { key, userId, expiresAt, isActive } = data as { key: string; userId: string; expiresAt?: Date | null; isActive?: boolean };
    const createData: any = { key, userId };
    if (expiresAt !== undefined) createData.expiresAt = expiresAt;
    if (isActive !== undefined) createData.isActive = isActive;
    return this.prisma.apiKey.create({ data: createData });
  }

  async findAll(filter?: { userId?: string }) {
    const where: any = { isActive: true };
    if (filter?.userId) where.userId = filter.userId;
    return this.prisma.apiKey.findMany({ where, orderBy: { createdAt: "desc" } });
  }

  async findById(id: number) {
    // return only active keys
    return this.prisma.apiKey.findFirst({ where: { id, isActive: true } });
  }

  async findByKey(key: string) {
    // check active keys only when validating uniqueness / authentication
    return this.prisma.apiKey.findFirst({ where: { key, isActive: true } });
  }

  async delete(id: number) {
    // Soft-delete: mark isActive=false and set deletedAt timestamp
    return this.prisma.apiKey.update({ where: { id }, data: { isActive: false, deletedAt: new Date() } });
  }
}
