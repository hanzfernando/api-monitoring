import type { ApiKeyRepository } from "./repository";
import type { ApiKey } from "./type";
import crypto from "crypto";

function generateSegment(length = 4) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let s = "";
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    s += chars[bytes[i] % chars.length];
  }
  return s;
}

function generateApiKey() {
  return [generateSegment(4), generateSegment(4), generateSegment(4), generateSegment(4)].join("-");
}

export class ApiKeyService {
  private repository: ApiKeyRepository;

  constructor(repository: ApiKeyRepository) {
    this.repository = repository;
  }

  async create(userId: string) {
    if (!userId) throw new Error("userId required");

    // generate unique key - retry on collision
    for (let i = 0; i < 5; i++) {
      const key = generateApiKey();
      const exists = await this.repository.findByKey(key);
      if (!exists) {
        return this.repository.create({ key, userId }) as unknown as ApiKey;
      }
    }

    // fallback - if we had collisions
    throw new Error("Failed to generate unique API key");
  }

  async list(userId?: string): Promise<ApiKey[]> {
    return (await this.repository.findAll(userId ? { userId } : undefined)) as unknown as ApiKey[];
  }

  async get(id: number): Promise<ApiKey> {
    const key = await this.repository.findById(id);
    if (!key) throw new Error("ApiKey not found");
    return key as unknown as ApiKey;
  }

  async remove(id: number, requestingUserId?: string) {
    const key = await this.get(id);
    // Only owner can delete for now
    if (requestingUserId && key.userId !== requestingUserId) {
      throw new Error("Not authorized to delete this key");
    }
    return this.repository.delete(id);
  }
}
