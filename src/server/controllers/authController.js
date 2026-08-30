import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config/env.js";
import * as authModel from "../models/authModel.js";

const cookieBaseOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: config.cookieSecure,
  path: "/"
};

const cookieOptions = {
  ...cookieBaseOptions,
  maxAge: 1000 * 60 * 60 * 8
};

function publicUser(user) {
  return {
    id: user.id,
    nombre: user.nombre,
    correo: user.correo,
    rol: user.rol
  };
}

export async function login(req, res, next) {
  try {
    const correo = typeof req.body?.correo === "string" ? req.body.correo.trim().toLowerCase() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";

    if (!correo || !password) {
      return res.status(400).json({ error: "Correo y contrasena son requeridos." });
    }
    if (correo.length > 160 || password.length > 128) {
      return res.status(400).json({ error: "Datos de acceso invalidos." });
    }

    const user = await authModel.findUserByEmail(correo);
    if (!user || user.estado !== "activo") {
      return res.status(401).json({ error: "Credenciales invalidas." });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: "Credenciales invalidas." });
    }

    const token = jwt.sign(
      publicUser(user),
      config.jwtSecret,
      { expiresIn: "8h" }
    );

    res.cookie("studio7_token", token, cookieOptions);
    return res.json({ user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
}

export function logout(_req, res) {
  res.clearCookie("studio7_token", cookieBaseOptions);
  return res.json({ ok: true });
}

export function me(req, res) {
  return res.json(req.user);
}
