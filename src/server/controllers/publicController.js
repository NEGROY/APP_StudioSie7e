import * as publicModel from "../models/publicModel.js";

const fallbackServices = [
  {
    id: 1,
    nombre: "Creación de Reels",
    precio: 1000,
    descripcion: "Creación de contenido en formato Reels para redes sociales.",
    caracteristicas: []
  },
  {
    id: 2,
    nombre: "Alquiler de estudio",
    precio: 300,
    descripcion: "Alquiler del estudio fotográfico para sesiones y producciones.",
    caracteristicas: []
  },
  {
    id: 3,
    nombre: "Fotografía de eventos",
    precio: 1200,
    descripcion: "Cobertura fotográfica para eventos y actividades especiales.",
    caracteristicas: [{ id: 1, nombre: "Bodas" }, { id: 3, nombre: "Invitación digital" }]
  },
  {
    id: 4,
    nombre: "Fotografía de XV años",
    precio: 800,
    descripcion: "Sesión fotográfica para celebración de quince años.",
    caracteristicas: [{ id: 2, nombre: "Sesión de fotos" }, { id: 4, nombre: "Marcos" }]
  },
  {
    id: 5,
    nombre: "Fotografía de cumpleaños",
    precio: 800,
    descripcion: "Sesión o cobertura fotográfica para cumpleaños.",
    caracteristicas: [{ id: 2, nombre: "Sesión de fotos" }, { id: 4, nombre: "Marcos" }]
  }
];

const fallbackPromotions = [
  {
    id: 1,
    titulo: "Agenda abierta",
    descripcion: "Reserva tu sesión o producción visual con parqueo propio en Cobán."
  }
];

function isDatabaseUnavailable(error) {
  return error?.code === "ECONNREFUSED" || error?.code === "ENOTFOUND";
}

export async function services(req, res, next) {
  try {
    const rows = await publicModel.getServicesCatalog();
    return res.json(rows);
  } catch (error) {
    if (isDatabaseUnavailable(error)) {
      return res.json(fallbackServices);
    }
    return next(error);
  }
}

export async function promotions(req, res, next) {
  try {
    const rows = await publicModel.getActivePromotions();
    return res.json(rows);
  } catch (error) {
    if (isDatabaseUnavailable(error)) {
      return res.json(fallbackPromotions);
    }
    return next(error);
  }
}

export async function announcements(req, res, next) {
  try {
    const rows = await publicModel.getActiveAnnouncements();
    return res.json(rows);
  } catch (error) {
    if (isDatabaseUnavailable(error)) {
      return res.json([]);
    }
    return next(error);
  }
}
