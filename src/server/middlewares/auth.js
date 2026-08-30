import jwt from "jsonwebtoken";
import { config } from "../config/env.js";
import { findActiveUserById } from "../models/authModel.js";

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const bearer = header.startsWith("Bearer ") ? header.slice(7) : null;
  const token = req.cookies?.studio7_token || bearer;

  if (!token) {
    return res.status(401).json({ error: "Sesion requerida." });
  }

  let payload;
  try {
    payload = jwt.verify(token, config.jwtSecret);
  } catch {
    return res.status(401).json({ error: "Sesion invalida." });
  }

  try {
    const user = await findActiveUserById(payload.id);
    if (!user) {
      return res.status(401).json({ error: "Sesion invalida." });
    }
    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.rol !== "admin") {
    return res.status(403).json({ error: "Permiso de administrador requerido." });
  }
  return next();
}
