import { PrismaClient } from "@prisma/client";

export class StationRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async create(data: { name: string; location: string }) {
    return this.prisma.station.create({ data });
  }

  async findAll() {
    return this.prisma.station.findMany({ orderBy: { createdAt: "desc" } });
  }

  async findById(id: number) {
    return this.prisma.station.findUnique({ where: { id } });
  }

  async update(id: number, data: { name?: string; location?: string }) {
    return this.prisma.station.update({ where: { id }, data });
  }

  async delete(id: number) {
    return this.prisma.station.delete({ where: { id } });
  }
}
