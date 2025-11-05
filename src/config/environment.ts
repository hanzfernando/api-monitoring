import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 4000,
  databaseUrl: process.env.DATABASE_URL || "",
  env: process.env.NODE_ENV || "development",

  cookie: process.env.COOKIE_NAME || "API_MONITORING_COOKIE_JWT",
  jwt: {
    secret: process.env.JWT_SECRET!, 
  },
};