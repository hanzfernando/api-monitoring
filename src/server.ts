import { config } from "./config/environment.ts";
import { App } from "./app.ts";

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