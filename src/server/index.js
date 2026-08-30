import cookieParser from "cookie-parser";
import express from "express";
import fs from "node:fs";
import jwt from "jsonwebtoken";
import path from "node:path";
import { fileURLToPath } from "node:url";
import adminRoutes from "./routes/adminRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import publicRoutes from "./routes/publicRoutes.js";
import { config } from "./config/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "Studio Siete API" });
});
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/anuncios", announcementRoutes);
app.use("/api/public", publicRoutes);

app.use((req, res, next) => {
  if (req.path !== "/admin" && !req.path.startsWith("/admin/")) {
    return next();
  }

  const token = req.cookies?.studio7_token;
  if (!token) {
    return res.redirect("/login");
  }

  try {
    const user = jwt.verify(token, config.jwtSecret);
    if (user.rol !== "admin") {
      return res.redirect("/");
    }
    return next();
  } catch {
    return res.redirect("/login");
  }
});

const distPath = path.resolve(__dirname, "../../dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  if (config.nodeEnv !== "production") {
    console.error(err);
  }
  res.status(status).json({
    error: status === 500 ? "Error interno del servidor." : err.message
  });
});

app.listen(config.port, () => {
  console.log(`Studio Siete API listening on port ${config.port}`);
});
