import { PrismaClient } from "@prisma/client";
import { ApiLog, ApiLogRequestHistory, ApiLogResponseTimeHistory } from "./type";

export class MonitorRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Convenience wrapper: accepts a Date or a period string (e.g. 'pastHour', 'pastDay', 'past7Days')
   * and delegates to the raw SQL implementation which returns properly bucketed results.
   */
  async getRequestHistory(
    apiKeyId: number,
    since: Date | "pastHour" | "pastDay" | "past7Days" | "pastWeek" | "pastMonth",
    interval: 'hourly' | 'daily'
  ): Promise<ApiLogRequestHistory[]> {
    const now = Date.now();
    const computeSince = (s: Date | string): Date => {
      if (s instanceof Date) return s;
      switch (s) {
        case 'pastHour':
          return new Date(now - 1 * 60 * 60 * 1000);
        case 'pastDay':
          return new Date(now - 24 * 60 * 60 * 1000);
        case 'past7Days':
        case 'pastWeek':
          return new Date(now - 7 * 24 * 60 * 60 * 1000);
        case 'pastMonth':
          return new Date(now - 30 * 24 * 60 * 60 * 1000);
        default:
          return new Date(now - 7 * 24 * 60 * 60 * 1000);
      }
    };

    const sinceDate = computeSince(since as Date | string);
    return this.getRequestHistoryRaw(apiKeyId, sinceDate, interval);
  }

  async create(log: {
    endpoint: string;
    method: string;
    statusCode: number;
    userId?: string | null;
    responseTime?: number | null;
    apiKeyId?: number | null;
    apiKeyValue?: string | null;
  }) {
    const data: any = {
      endpoint: log.endpoint,
      method: log.method,
      statusCode: log.statusCode,
      apiKeyValue: log.apiKeyValue ?? "",
    };

    if (log.userId !== undefined && log.userId !== null) {
      data.userId = log.userId;
    }

    if (log.responseTime !== undefined && log.responseTime !== null) {
      data.responseTime = log.responseTime;
    }

    if (log.apiKeyId !== undefined && log.apiKeyId !== null) {
      data.apiKeyId = log.apiKeyId;
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

  async findByApiKeyId(apiKeyId: number, userId: string) {
    // return logs for an apiKeyId but ensure ownership: either the log.userId matches
    // or the related apiKey belongs to the same user.
    const where: any = { apiKeyId };
    where.AND = [
      {
        OR: [{ userId: userId }, { apiKey: { userId: userId } }],
      },
    ];

    return this.prisma.apiLog.findMany({ where, orderBy: { createdAt: "desc" } });
  }

  async delete(id: number) {
    return this.prisma.apiLog.delete({ where: { id } });
  }

  async getAverageResponseTime(apiKeyId: number): Promise<number> {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000); // last 24 hours

    const result = await this.prisma.apiLog.aggregate({
      where: {
        apiKeyId,
        createdAt: { gte: since },
        NOT: ({ responseTime: null } as any),
      },
      _avg: { responseTime: true },
    });

    return Number(result._avg?.responseTime?.toFixed(2)) ?? 0;
  }
  
  async getPastHourRequestCount(apiKeyId: number): Promise<number> {
    const since = new Date(Date.now() - 60 * 60 * 1000); // last 1 hour
    return this.prisma.apiLog.count({
      where: {
        apiKeyId,
        createdAt: { gte: since },
      },
    });

  }

  async getRequestHistoryRaw(
    apiKeyId: number,
    since: Date,
    interval: 'hourly' | 'daily'
  ): Promise<ApiLogRequestHistory[]> {
    const trunc = interval === 'hourly' ? 'hour' : 'day';
    const step = interval === 'hourly' ? '1 hour' : '1 day';

    // Build a safe SQL string: trunc and step are controlled server-side and validated above.
    // Use $queryRawUnsafe so the interval/unit are SQL literals (date_trunc requires a literal unit).
    const sinceIso = since.toISOString();
    // bucket size in seconds to avoid timezone/truncation mismatches
    const bucketSeconds = interval === 'hourly' ? 60 * 60 : 24 * 60 * 60;

    const sql = `
      SELECT
        s.epoch as epoch,
        COALESCE(a.request_count, 0) AS "requestCount",
        COALESCE(a.min_id, 0) AS id,
        COALESCE(a.api_key_value, k.key, '') AS "apiKeyValue"
      FROM generate_series(
            floor(extract(epoch from '${sinceIso}'::timestamptz)/${bucketSeconds})*${bucketSeconds},
            floor(extract(epoch from now())/${bucketSeconds})*${bucketSeconds},
            ${bucketSeconds}
          ) AS s(epoch)
      LEFT JOIN (
        SELECT
          floor(extract(epoch from "createdAt")/${bucketSeconds})*${bucketSeconds} AS epoch,
          COUNT(*) AS request_count,
          MIN(id) AS min_id,
          MAX("apiKeyValue") AS api_key_value
        FROM api_logs
        WHERE "apiKeyId" = ${apiKeyId}
          AND "createdAt" >= '${sinceIso}'::timestamptz
        GROUP BY epoch
      ) a ON a.epoch = s.epoch
      LEFT JOIN api_keys k ON k.id = ${apiKeyId}
      ORDER BY s.epoch ASC;
    `;

    const rows: Array<{
      epoch: string | number;
      requestCount: string | number;
      id: string | number;
      apiKeyValue: string;
    }> = await this.prisma.$queryRawUnsafe(sql);

    return rows.map((r) => ({
      id: Number(r.id) || 0,
      apiKeyId,
      apiKeyValue: r.apiKeyValue ?? '',
      dateTime: new Date(Number(r.epoch) * 1000),
      requestCount: Number(r.requestCount) || 0,
    }));
  }

  async getResponseHistory(
    apiKeyId: number,
    since: Date | "pastHour" | "pastDay" | "past7Days" | "pastWeek" | "pastMonth",
    interval: 'hourly' | 'daily'
  ): Promise<ApiLogResponseTimeHistory[]> {
    const now = Date.now();
    const computeSince = (s: Date | string): Date => {
      if (s instanceof Date) return s;
      switch (s) {
        case 'pastHour':
          return new Date(now - 1 * 60 * 60 * 1000);
        case 'pastDay':
          return new Date(now - 24 * 60 * 60 * 1000);
        case 'past7Days':
        case 'pastWeek':
          return new Date(now - 7 * 24 * 60 * 60 * 1000);
        case 'pastMonth':
          return new Date(now - 30 * 24 * 60 * 60 * 1000);
        default:
          return new Date(now - 7 * 24 * 60 * 60 * 1000);
      }
    };

    const sinceDate = computeSince(since as Date | string);
    return this.getResponseHistoryRaw(apiKeyId, sinceDate, interval);
  }

  async getResponseHistoryRaw(
    apiKeyId: number,
    since: Date,
    interval: 'hourly' | 'daily'
  ): Promise<ApiLogResponseTimeHistory[]> {
    const sinceIso = since.toISOString();
    const bucketSeconds = interval === 'hourly' ? 60 * 60 : 24 * 60 * 60;

    const sql = `
      SELECT
        s.epoch as epoch,
        COALESCE(a.request_count, 0) AS request_count,
        COALESCE(a.min_id, 0) AS id,
        COALESCE(a.avg_response_time, NULL) AS avg_response_time,
        COALESCE(a.api_key_value, k.key, '') AS api_key_value
      FROM generate_series(
            floor(extract(epoch from '${sinceIso}'::timestamptz)/${bucketSeconds})*${bucketSeconds},
            floor(extract(epoch from now())/${bucketSeconds})*${bucketSeconds},
            ${bucketSeconds}
          ) AS s(epoch)
      LEFT JOIN (
        SELECT
          floor(extract(epoch from "createdAt")/${bucketSeconds})*${bucketSeconds} AS epoch,
          COUNT(*) AS request_count,
          MIN(id) AS min_id,
          AVG("responseTime") AS avg_response_time,
          MAX("apiKeyValue") AS api_key_value
        FROM api_logs
        WHERE "apiKeyId" = ${apiKeyId}
          AND "createdAt" >= '${sinceIso}'::timestamptz
        GROUP BY epoch
      ) a ON a.epoch = s.epoch
      LEFT JOIN api_keys k ON k.id = ${apiKeyId}
      ORDER BY s.epoch ASC;
    `;

    const rows: Array<{
      epoch: string | number;
      id: string | number;
      avg_response_time: string | number | null;
      api_key_value: string;
    }> = await this.prisma.$queryRawUnsafe(sql);

    return rows.map((r) => ({
      id: Number(r.id) || 0,
      apiKeyId,
      apiKeyValue: r.api_key_value ?? '',
      dateTime: new Date(Number(r.epoch) * 1000),
      averageResponseTime: r.avg_response_time !== null ? Math.round(Number(r.avg_response_time) * 100) / 100 : 0,
    }));
  }
}
