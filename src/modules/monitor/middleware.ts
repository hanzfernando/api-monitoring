import type { Request, Response, NextFunction } from "express";
import { performance } from "perf_hooks";
import { MonitorRepository } from "./repository";

/**
 * Creates an express middleware that records every request/response into the ApiLog table.
 * It listens to the `finish` event on the response to capture the final status code.
 * Uses performance.now() for high-precision timing (microsecond accuracy).
 */
export function createMonitorMiddleware(repository: MonitorRepository) {
  return function monitorMiddleware(req: Request, res: Response, next: NextFunction) {
    // Capture start time with high precision
    const startedAt = performance.now();
    
    res.on("finish", async () => {
      try {
        const statusCode = res.statusCode;
        const endpoint = req.originalUrl || req.url;
        const method = req.method;
        
        // Try to extract user id if authentication middleware populated it
        const userId = (req as any).user?.id ?? null;
        
        // Calculate response time in milliseconds with decimal precision
        const responseTime = performance.now() - startedAt;
        
        await repository.create({
          endpoint,
          method,
          statusCode,
          userId,
          responseTime: Math.round(responseTime), // Round to nearest ms if your DB expects integer
          // OR: responseTime: Number(responseTime.toFixed(2)), // Keep 2 decimal places
        });
      } catch (err) {
        // Swallow errors to avoid breaking the request chain
        // Logging to stdout for diagnostics
        // eslint-disable-next-line no-console
        console.error("Monitor middleware error:", err);
      }
    });
    
    next();
  };
}