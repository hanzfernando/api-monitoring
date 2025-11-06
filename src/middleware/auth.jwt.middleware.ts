/**
 * Authentication middleware for JWT token validation
 * Provides both static methods and instance methods for flexibility
 */
import type { Request, Response, NextFunction } from "express";
import type { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { config } from "../config/environment";
import { prisma } from "../config/database.config";

// Extend Express Request interface to include user data
declare global {
  namespace Express {
    interface User {
      id: string | number;
      name?: string | null;
      role?: string | null;
      [k: string]: any;
    }

    interface Request {
      auth?: {
        type: "apikey" | "jwt" | "none";
        credentialId?: string | null;
        source?: "header" | "cookie" | "unknown";
        scopes?: string[];
        [k: string]: any;
      };

      apiKey?: {
        id: string;
        key?: string;
        scopes?: string[];
        [k: string]: any;
      };

      user?: User;
    }
  }
}

class AppErrorJWT extends Error {
  constructor(public message: string, public statusCode: number) {
    super(message);
    this.name = "AppError";
  }
}

interface TokenPayload {
  id: string;
  iat: number;
  exp: number;
}

function extractToken(req: Request): string | undefined {
  let token: string | undefined;
  const authHeader = req.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.slice(7).trim();
  }

  if (!token && req.get("cookie")) {
    const cookieHeader = req.get("cookie") ?? "";
    const cookieName = config.cookie || "jwt";
    const match = cookieHeader
      .split(";")
      .map(s => s.trim())
      .find(s => s.startsWith(`${cookieName}=`));
    if (match) {
      token = match.split("=")[1];
    }
  }

  return token;
}

export class AuthMiddleware {
  static protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = extractToken(req);

      if (!token) {
        return next(new AppErrorJWT("You are not logged in. Please log in to get access.", 401));
      }

      const decoded = jwt.verify(token, config.jwt.secret as string) as TokenPayload;

      const currentUser = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, name: true },
      });

      if (!currentUser) {
        return next(new AppErrorJWT("The user belonging to this token no longer exists.", 401));
      }

      req.user = { id: currentUser.id, name: currentUser.name } as any;

      return next();
    } catch (error: any) {
      if (error instanceof jwt.JsonWebTokenError) {
        return next(new AppErrorJWT("Invalid token. Please log in again.", 401));
      }
      if (error instanceof jwt.TokenExpiredError) {
        return next(new AppErrorJWT("Your token has expired! Please log in again.", 401));
      }
      return next(new AppErrorJWT("Authentication failed", 401));
    }
  };
}

export const protect = AuthMiddleware.protect;
export default AuthMiddleware;
