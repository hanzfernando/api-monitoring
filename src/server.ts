import { config } from "./config/environment";
import { App } from "./app";

// Log startup
console.log("Starting Kloudtrack Server...");
console.log("Environment:", process.env.NODE_ENV);
console.log("Port:", config.port);

// Start the application with configured ports
const app = new App();
app.start(Number(config.port)).catch((err: any) => {
  console.error("STARTUP ERROR:", err);
  console.log("Failed to start application:", err);
  process.exit(1);
});

// Graceful shutdown handlers — ensure server and DB are closed on exit signals
const shutdown = async (signal?: string) => {
  try {
    if (signal) console.log(`Received ${signal}, shutting down...`);
    await app.stop();
    console.log('Shutdown complete');
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  shutdown('uncaughtException');
});
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  shutdown('unhandledRejection');
});