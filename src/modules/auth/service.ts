import type { AuthRepository } from "./repository";

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
  async login(name: string, password: string) {
    const user = await this.repository.findByName(name);
    if (!user) {
      throw new Error("Invalid credentials");
    }

    if (user.password !== password) {
      throw new Error("Invalid credentials");
    }

    return { user };
  }

  async register(name: string, password: string) {
    const existingUser = await this.repository.findByName(name);
    if (existingUser) {
      throw new Error("User already exists");
    }
    const user = await this.repository.createUser(name, password);
    return { user };
  }

  async logout() {
    // In a real application, you would handle token invalidation here
    return;
  }
}
