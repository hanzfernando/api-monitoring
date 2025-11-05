import type { MonitorRepository } from "./repository";

export class MonitorService {
  private repository: MonitorRepository;

  constructor(repository: MonitorRepository) {
    this.repository = repository;
  }

  async record(log: {
    endpoint: string;
    method: string;
    statusCode: number;
    userId?: string | null;
    responseTime?: number | null;
  }) {
    return this.repository.create(log);
  }

  async list(filter?: { userId?: string; endpoint?: string; statusCode?: number }) {
    return this.repository.findAll(filter);
  }

  async get(id: number) {
    const log = await this.repository.findById(id);
    if (!log) throw new Error("Log not found");
    return log;
  }

  async remove(id: number) {
    await this.get(id);
    return this.repository.delete(id);
  }
}
