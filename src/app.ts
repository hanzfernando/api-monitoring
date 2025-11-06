import { PrismaClient } from "@prisma/client";
import logger from "./core/middlewares/logger.middleware";
import cors from "cors";
import http from "http";
import type { Application } from "express";
import express from "express";
import { AppRoutes } from "./route";
import { AuthContainer } from "./modules/auth/container";
import { StationContainer } from "./modules/station/container";
import { MonitorContainer } from "./modules/monitor/container";
import monitorMiddleware from "./middleware/monitor.middleware";
import { ApiKeyContainer } from "./modules/apiKey/container";

export class App {
  public app: Application;
  public server: http.Server | null = null;

  private prisma: PrismaClient;
  private appRoutes!: AppRoutes;
  private authContainer!: AuthContainer;
  private stationContainer!: StationContainer;
  private monitorContainer!: MonitorContainer;
  private apiKeyContainer!: ApiKeyContainer;

  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);

    this.prisma = new PrismaClient();
    this.authContainer = new AuthContainer(this.prisma);
  this.stationContainer = new StationContainer(this.prisma);
  this.monitorContainer = new MonitorContainer(this.prisma);
  this.apiKeyContainer = new ApiKeyContainer(this.prisma);

    this.configureMiddleware();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.appRoutes = new AppRoutes(
      this.prisma,
      this.authContainer,
      this.stationContainer,
      this.monitorContainer,
      this.apiKeyContainer
    );

    this.app.use("/api", this.appRoutes.getRouter());
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

    // Register monitor middleware to record incoming requests and responses
    // if (this.monitorContainer && this.monitorContainer.middleware) {
    //   this.app.use(this.monitorContainer.middleware);
    // }

    // Global request monitor (records method, path, status, response time, userId if present)
    this.app.use(monitorMiddleware);

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
      // Close the HTTP server and wait until it's fully closed. Wrap in a Promise
      if (this.server) {
        await new Promise<void>((resolve, reject) => {
          this.server!.close((err?: Error) => {
            if (err) return reject(err);
            resolve();
          });
        });
      }

      // Disconnect prisma client
      await this.prisma.$disconnect();
      console.log("Disconnected from database");
    } catch (error) {
      console.error("Error during shutdown:", error);
    }
  }
}

