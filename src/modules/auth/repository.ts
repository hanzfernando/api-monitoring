import { PrismaClient } from "@prisma/client";

export class AuthRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Find a user by name. Using findFirst because `name` is not declared unique in the schema.
   */
  async findByName(name: string) {
    return this.prisma.user.findFirst({ where: { name } });
  }

  /**
   * Helper to create a test user (useful while testing). Returns created user.
   */
  async createUser(name: string, password: string) {
    return this.prisma.user.create({ data: { name, password } });
  }


}
