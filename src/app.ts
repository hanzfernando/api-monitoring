import { PrismaClient } from "@prisma/client";
import logger from "./core/middlewares/logger.middleware.ts";
import cors from "cors";
import http from "http";
import type { Application } from "express";
import express from "express";

export class App {
  public app: Application;
  public server: http.Server | null = null;

  private prisma: PrismaClient;
  // private appRoutes!: AppRoutes;

  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);

    this.prisma = new PrismaClient();
    // this.appRoutes = new AppRoutes(this.prisma);

    this.configureMiddleware();
  }

  private configureMiddleware(): void {
    // Security middleware first

    this.app.use(logger);
    this.app.use(cors({
      origin: process.env.CLIENT_URL,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true
    }));

   
    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "10mb" }));

    this.app.set("trust proxy", 1);

  }

  public async initialize(): Promise<void> {
    try {
      console.log("Connecting to database...");
      await this.prisma.$connect();
      console.log("Database connected successfully");

    } catch (error) {
      console.error("INITIALIZATION ERROR:", error);
      await this.stop();
      throw error;
    }
  }

  public async start(port: number = 3000, wsPort: number = 3001): Promise<void> {
    try {
     

      await this.initialize();

      this.server!.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
      });

    } catch (error) {
      console.error("Failed to start server:", error);
      await this.stop();
      process.exit(1);
    }
  }

  public async stop(): Promise<void> {
    try {
      
      this.server!.close();

      await this.prisma.$disconnect();
      console.log("Disconnected from database");
    } catch (error) {
      console.error("Error during shutdown:", error);
    }
  }
}

