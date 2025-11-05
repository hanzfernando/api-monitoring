import { generateAuthToken } from "../../utils/auth";
import type { AuthRepository } from "./repository";
import type { Response } from "express";
import { config } from "../../config/environment";

export class AuthService {
  private repository: AuthRepository;

  constructor(repository: AuthRepository) {
    this.repository = repository;
  }

  /**
   * Simple login for testing only.
   * - looks up user by name
   * - compares password in plain text (NOT secure)
   * - returns a dummy token and the user when successful
   */
  async login(name: string, password: string, res: any) {
    const user = await this.repository.findByName(name);
    if (!user) {
      throw new Error("Invalid credentials");
    }

    if (user.password !== password) {
      throw new Error("Invalid credentials");
    }

    const token = generateAuthToken(user.id, res);

    return { user, token };
  }

  async register(name: string, password: string, res: any) {
    const existingUser = await this.repository.findByName(name);
    if (existingUser) {
      throw new Error("User already exists");
    }
    const user = await this.repository.createUser(name, password);
    const token = generateAuthToken(user.id, res);
    return { user, token };
  }

  async logout(res: Response) {
    // Clear the auth cookie set in generateAuthToken.
    // In a real application, you may also invalidate the token server-side.
    try {
      res.clearCookie(config.cookie, {
        httpOnly: true,
        sameSite: config.env !== "development" ? "none" : "strict",
        secure: config.env !== "development",
        path: "/",
      });
    } catch (err) {
      // ignore cookie clearing errors - controller will handle response
    }
    return;
  }
}
