import type { Request, Response, NextFunction } from "express";
import { prisma } from "../config/database.config";

class AppError extends Error {
  constructor(public message: string, public statusCode: number) {
    super(message);
    this.name = "AppError";
  }
}

export class ApiKeyMiddleware {
  static protect = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const headerName = "x-kloudtrack-key";
      const headerValue = req.get(headerName) ?? req.get(headerName.toUpperCase());

      if (!headerValue) {
        return next(new AppError("Missing API key header", 401));
      }

      const apiKeyValue = headerValue.trim();
      if (!apiKeyValue) {
        return next(new AppError("Empty API key", 401));
      }

      const record = await prisma.apiKey.findUnique({
        where: { key: apiKeyValue },
        include: { user: true },
      });

      if (!record) {
        return next(new AppError("Invalid API key", 401));
      }

      // check expiry if present
      const expiresAt = (record as any).expiresAt;
      if (expiresAt) {
        const expiresDate = expiresAt instanceof Date ? expiresAt : new Date(expiresAt);
        if (new Date() > expiresDate) {
          return next(new AppError("API key expired", 401));
        }
      }

      // attach user and apiKey info to request (keep minimal responsibilities)
      req.user = {
        id: record.user.id,
        name: record.user.name ?? null,
        ...(record.user as any),
      } as any;

      req.apiKey = {
        id: String(record.id),
        key: record.key,
        scopes: (record as any).scopes ?? [],
      };

      // DO NOT set req.auth here — leave that to the auth pipeline that centralizes the context
      return next();
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error("ApiKeyMiddleware error:", err);
      return next(new AppError("Authentication failed", 500));
    }
  };
}

export const apiKeyProtect = ApiKeyMiddleware.protect;
export default ApiKeyMiddleware;