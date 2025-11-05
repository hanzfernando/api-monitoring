import type { Request, Response, NextFunction } from "express";
import { apiKeyProtect } from "./apiKey.middleware";
import { protect as jwtProtect } from "./auth.middleware";

/**
 * Helper: run an express middleware as a Promise
 */
function runMw(mw: any, req: Request, res: Response) {
  return new Promise<void>((resolve, reject) => {
    try {
      mw(req, res, (err?: any) => {
        if (err) return reject(err);
        return resolve();
      });
    } catch (err) {
      return reject(err);
    }
  });
}

/**
 * Normalize req.user into a predictable shape and attach authType
 */
function normalizeAuth(req: Request, provider: "apiKey" | "jwt") {
  const u = (req as any).user;
  if (!u) return;
  (req as any).user = {
    id: String(u.id),
    name: u.name ?? u.email ?? null,
    role: u.role ?? (u.isAdmin ? "ADMIN" : "USER"),
    ...u,
  };
  (req as any).authType = provider;
}

/**
 * eitherAuth: succeed if either API key auth OR JWT auth passes.
 * Strategy: API key first (preferred for programmatic clients); JWT fallback.
 */
export async function eitherAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const header = req.get("x-kloudtrack-key");
    console.log('Either auth header:', header);
    if (header) {
      // Try API key first when header present
      await runMw(apiKeyProtect as any, req, res);
      normalizeAuth(req, "apiKey");
      return next();
    }

    // No api-key header, fallback to JWT protect
    await runMw(jwtProtect as any, req, res);
    normalizeAuth(req, "jwt");
    return next();
  } catch (err) {
    // If both fail, forward the last error
    return next(err);
  }
}

/**
 * optionalAuth: attach user if any auth succeeds, otherwise continue anonymously
 */
export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const header = req.get("x-kloudtrack-key");
    if (header) {
      try {
        await runMw(apiKeyProtect as any, req, res);
        normalizeAuth(req, "apiKey");
        return next();
      } catch (_) {
        // ignore and try JWT
      }
    }

    try {
      await runMw(jwtProtect as any, req, res);
      normalizeAuth(req, "jwt");
    } catch (_) {
      // no auth available, proceed anonymously
    }

    return next();
  } catch (err) {
    return next(err);
  }
}

export default eitherAuth;
