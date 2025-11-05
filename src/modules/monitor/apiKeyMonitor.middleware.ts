import type { Request, Response, NextFunction } from "express";
import { performance } from "perf_hooks";
import { MonitorRepository } from "./repository";

/**
 * Creates an express middleware that records requests authenticated with an API key.
 * It checks for `req.authType === 'apiKey'` or presence of `req.apiKey` and only logs those.
 */
export function createApiKeyMonitorMiddleware(repository: MonitorRepository) {
  return function apiKeyMonitorMiddleware(req: Request, res: Response, next: NextFunction) {
    const startedAt = performance.now();

    res.on("finish", async () => {
      try {
        // Only record if request was authenticated via API key
        const authType = (req as any).authType as string | undefined;
        const hasApiKey = !!(req as any).apiKey;
        if (authType !== "apiKey" && !hasApiKey) return; // skip non-api-key requests

        const statusCode = res.statusCode;
        const endpoint = req.originalUrl || req.url;
        const method = req.method;
        const userId = (req as any).user?.id ?? null;
        const responseTime = performance.now() - startedAt;

        await repository.create({
          endpoint,
          method,
          statusCode,
          userId,
          responseTime: Math.round(responseTime),
        });
      } catch (err) {
        // swallow errors
        // eslint-disable-next-line no-console
        console.error("ApiKey monitor middleware error:", err);
      }
    });

    next();
  };
}
