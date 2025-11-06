import type { Request, Response, NextFunction } from "express";
import { performance } from "perf_hooks";
import { prisma } from "../config/database.config";

export function monitorMiddleware(req: Request, res: Response, next: NextFunction) {
  const startedAt = performance.now();

  res.on("finish", async () => {
    try {
      if (req.auth?.type !== "apikey") return;

      const statusCode = res.statusCode;
      const endpoint = req.originalUrl || req.url;
      const method = req.method;
      const userId = req.user?.id ?? null;
      const responseTimeMs = performance.now() - startedAt;
      const responseTime = Math.round(responseTimeMs);

      const data: any = {
        endpoint,
        method,
        statusCode,
        responseTime,
      };

      if (userId) data.userId = String(userId);

      await prisma.apiLog.create({ data });
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error("monitorMiddleware: failed to record api log", {
        message: err?.message ?? String(err),
        path: req.originalUrl || req.url,
        method: req.method,
      });
    }
  });

  return next();
}

export default monitorMiddleware;