import type { Request, Response, NextFunction } from "express";
import { apiKeyProtect } from "./auth.apiKey.middleware";
import { protect as jwtProtect } from "./auth.jwt.middleware";

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

function attachAuthContext(req: Request, provider: "apiKey" | "jwt") {
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
    type: provider === "apiKey" ? "apikey" : "jwt",
    credentialId: provider === "apiKey" ? req.apiKey?.id ?? null : req.user?.id ?? null,
    source: provider === "apiKey" ? "header" : "cookie",
    scopes: req.apiKey?.scopes ?? req.user?.scopes ?? [],
  } as any;
}

function setAuthContext(req: Request, type: "apiKey" | "jwt", user: any, credentialId: string | number, scopes: string[] = []) {
  req.user = user;
  // normalize to lowercase 'apikey' to match Request typing in auth.jwt.middleware.ts
  req.auth = { type: type === "apiKey" ? "apikey" : "jwt", credentialId: credentialId != null ? String(credentialId) : null, scopes } as any;
}

export async function eitherAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.get("x-kloudtrack-key");
  // prefer API key auth when header is present, otherwise fallback to JWT
  try {
    if (header) {
      // If api key header exists, attempt API key auth and return on success
      await runMw(apiKeyProtect, req, res);
      setAuthContext(req, "apiKey", req.user, req.apiKey!.id, req.apiKey!.scopes);
      return next();
    }

    // No api-key header, try JWT
    await runMw(jwtProtect, req, res);
    setAuthContext(req, "jwt", req.user, req.user!.id);
    return next();
  } catch (err) {
    // Forward the authentication error to the next error handler
    return next(err);
  }

}

export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.get("x-kloudtrack-key");

  if (header) {
    try {
      await runMw(apiKeyProtect as any, req, res);
      attachAuthContext(req, "apiKey");
      return next();
    } catch (_) {
      // fallthrough
    }
  }

  try {
    await runMw(jwtProtect as any, req, res);
    attachAuthContext(req, "jwt");
    return next();
  } catch (_) {
    req.auth = { type: "none" } as any;
    return next();
  }
}

export default eitherAuth;