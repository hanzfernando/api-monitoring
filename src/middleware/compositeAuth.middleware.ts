import type { Request, Response, NextFunction } from "express";
import { apiKeyProtect } from "./auth.apiKey.middleware";
import { protect as jwtProtect } from "./auth.jwt.middleware";

class CompositeAuthMiddleware {
  private static runMw(mw: any, req: Request, res: Response) {
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

  private static attachAuthContext(req: Request, provider: "apiKey" | "jwt") {
    const u = req.user as any;
    if (u) {
      req.user = {
        id: String(u.id),
        name: u.name ?? u.email ?? null,
        role: u.role ?? (u.isAdmin ? "ADMIN" : "USER"),
        ...u,
      } as any;
    }

    req.auth = {
      type: provider === "apiKey" ? "apiKey" : "jwt",
      credentialId: provider === "apiKey" ? req.apiKey?.id ?? null : req.user?.id ?? null,
      source: provider === "apiKey" ? "header" : "cookie",
      scopes: req.apiKey?.scopes ?? req.user?.scopes ?? [],
    } as any;
  }

  private static setAuthContext(req: Request, type: "apiKey" | "jwt", user: any, credentialId: string | number, scopes: string[] = []) {
    req.user = user;
    req.auth = { type: type === "apiKey" ? "apiKey" : "jwt", credentialId: credentialId != null ? String(credentialId) : null, scopes } as any;
  }

  static async either(req: Request, res: Response, next: NextFunction) {
    const header = req.get("x-kloudtrack-key");
    // prefer API key auth when header is present, otherwise fallback to JWT
    try {
      if (header) {
        // If api key header exists, attempt API key auth and return on success
        await CompositeAuthMiddleware.runMw(apiKeyProtect, req, res);
        CompositeAuthMiddleware.setAuthContext(req, "apiKey", req.user, req.apiKey!.id, req.apiKey!.scopes);
        return next();
      }

      // No api-key header, try JWT
      await CompositeAuthMiddleware.runMw(jwtProtect, req, res);
      CompositeAuthMiddleware.setAuthContext(req, "jwt", req.user, req.user!.id);
      return next();
    } catch (err) {
      // Forward the authentication error to the next error handler
      return next(err);
    }
  }

  static async optional(req: Request, res: Response, next: NextFunction) {
    const header = req.get("x-kloudtrack-key");

    if (header) {
      try {
        await CompositeAuthMiddleware.runMw(apiKeyProtect as any, req, res);
        CompositeAuthMiddleware.attachAuthContext(req, "apiKey");
        return next();
      } catch (_) {
        // fallthrough
      }
    }

    try {
      await CompositeAuthMiddleware.runMw(jwtProtect as any, req, res);
      CompositeAuthMiddleware.attachAuthContext(req, "jwt");
      return next();
    } catch (_) {
      req.auth = { type: "none" } as any;
      return next();
    }
  }
}

export const eitherAuth = CompositeAuthMiddleware.either;
export const optionalAuth = CompositeAuthMiddleware.optional;
export default CompositeAuthMiddleware;