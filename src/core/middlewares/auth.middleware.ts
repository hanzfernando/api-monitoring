/**
 * Authentication middleware for JWT token validation
 * Provides both static methods and instance methods for flexibility
 */
import type { Request, Response, NextFunction } from "express";
import type { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { config } from "../../config/environment";
import { prisma } from "../../config/database.config";

// Extend Express Request interface to include user data
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string | null;
        [key: string]: any;
      };
    }
  }
}

/**
 * Custom error class for authentication errors
 */
class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = "AppError";
  }
}

/**
 * Token payload interface
 */
interface TokenPayload {
  id: string;
  iat: number;
  exp: number;
}

/**
 * Extract JWT token from request (Authorization header or Cookie)
 */
function extractToken(req: Request): string | undefined {
  let token: string | undefined;

  // Try Authorization header first
  const authHeader = req.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.slice(7).trim();
  }

  // Fallback: try to read token from Cookie header
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

/**
 * Authentication middleware class with static and instance methods
 */
export class AuthMiddleware {
  /**
   * Static middleware to protect routes requiring authentication
   * Validates JWT tokens and attaches user data to request object
   */
  static protect = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Extract JWT from cookies or authorization header
      const token = extractToken(req);

      if (!token) {
        return next(
          new AppError("You are not logged in. Please log in to get access.", 401)
        );
      }

      const decoded = jwt.verify(token, config.jwt.secret as string) as TokenPayload;

      const currentUser = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          name: true,
        },
      });

      if (!currentUser) {
        return next(
          new AppError("The user belonging to this token no longer exists.", 401)
        );
      }

      req.user = {
        id: currentUser.id,
        name: currentUser.name,
      };

      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return next(new AppError("Invalid token. Please log in again.", 401));
      }
      if (error instanceof jwt.TokenExpiredError) {
        return next(new AppError("Your token has expired! Please log in again.", 401));
      }
      return next(new AppError("Authentication failed", 401));
    }
  };

  /**
   * Creates an instance of AuthMiddleware with configurable dependencies
   * @param jwtSecret - JWT secret for token verification
   * @param prismaClient - Prisma client for database operations
   */
  constructor(
    private jwtSecret: string = config.jwt.secret as string,
    private prismaClient: PrismaClient = prisma
  ) {}

  /**
   * Instance method for authentication protection (useful for testing)
   */
  protect = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const token = extractToken(req);
      if (!token) {
        return next(
          new AppError("You are not logged in. Please log in to get access.", 401)
        );
      }

      const decoded = jwt.verify(token, this.jwtSecret) as TokenPayload;

      const currentUser = await this.prismaClient.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          name: true,
        },
      });

      if (!currentUser) {
        return next(
          new AppError("The user belonging to this token no longer exists.", 401)
        );
      }

      req.user = {
        id: currentUser.id,
        name: currentUser.name,
      };

      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return next(new AppError("Invalid token. Please log in again.", 401));
      }
      if (error instanceof jwt.TokenExpiredError) {
        return next(new AppError("Your token has expired! Please log in again.", 401));
      }
      return next(new AppError("Authentication failed", 401));
    }
  };
}

/**
 * Export static protect method for convenient usage
 */
export const protect = AuthMiddleware.protect;

/**
 * Export the AppError for external usage
 */
export { AppError };