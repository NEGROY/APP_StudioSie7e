import dotenv from "dotenv";

dotenv.config();

const nodeEnv = process.env.NODE_ENV || "development";
const jwtSecret = process.env.JWT_SECRET || (nodeEnv === "production" ? "" : "studio-siete-dev-secret-change-me");

if (!jwtSecret) {
  throw new Error("JWT_SECRET es requerido en produccion.");
}

export const config = {
  port: Number(process.env.PORT || 3000),
  databaseUrl: process.env.DATABASE_URL || "postgresql://studio7_user:studio7_password@localhost:5432/studio7",
  jwtSecret,
  nodeEnv,
  cookieSecure: process.env.COOKIE_SECURE === "true" || process.env.NODE_ENV === "production"
};
