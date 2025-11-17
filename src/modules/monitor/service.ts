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

  async listByApiKeyId(apiKeyId: number, userId: string) {
    return this.repository.findByApiKeyId(apiKeyId, userId);
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

  async getAverageResponseTime(apiKeyId: number) {
    const responseTimes = await this.repository.getAverageResponseTime(apiKeyId);
    return responseTimes;
  }

  async getPastHourRequestCount(apiKeyId: number) {
    const count = await this.repository.getPastHourRequestCount(apiKeyId);
    return count;
  }

  async getRequestHistory(
    apiKeyId: number,
    since: Date | "pastHour" | "pastDay" | "past7Days" | "pastWeek" | "pastMonth",
    interval: "hourly" | "daily"
  ) {
    // delegate to repository.getRequestHistory which accepts both Date and period-strings
    return this.repository.getRequestHistory(apiKeyId, since as any, interval);
  }

  async getResponseHistory(
    apiKeyId: number,
    since: Date | "pastHour" | "pastDay" | "past7Days" | "pastWeek" | "pastMonth",
    interval: "hourly" | "daily"
  ) {
    return this.repository.getResponseHistory(apiKeyId, since as any, interval);
  }

  async getCombinedHistory(
    apiKeyId: number,
    since: Date | "pastHour" | "pastDay" | "past7Days" | "pastWeek" | "pastMonth",
    interval: "hourly" | "daily"
  ) {
    return this.repository.getCombinedHistory(apiKeyId, since as any, interval);
  }

  async getCombinedHistoryForUser(
    userId: string,
    since: Date | "pastHour" | "pastDay" | "past7Days" | "pastWeek" | "pastMonth",
    interval: "hourly" | "daily"
  ) {
    return this.repository.getCombinedHistoryForUser(userId, since as any, interval);
  }
}
