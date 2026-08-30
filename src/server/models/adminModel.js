import { query } from "../config/db.js";

const resourceAliases = {
  "agentes-modelos": "agentes_modelos"
};

export const tableConfig = {
  anuncios: {
    table: "tb_anuncios",
    columns: ["titulo", "descripcion", "estilo_id", "fecha_inicio", "fecha_fin", "imagen_url", "estado", "promocion_id"],
    activeFirst: true
  },
  estilos: {
    table: "tb_estilos",
    columns: ["nombre", "descripcion", "estado"],
    activeFirst: true
  },
  agentes_modelos: {
    table: "tb_agentes_modelos",
    columns: ["nombre", "dpi", "telefono", "ubicacion", "correo", "foto_url", "fecha_inicio", "salario", "puesto", "comentarios", "estado"],
    activeFirst: true,
    paginated: true
  },
  servicios: {
    table: "tb_servicios",
    columns: ["nombre", "precio", "descripcion", "estado"],
    activeFirst: true,
    paginated: true
  },
  caracteristicas: {
    table: "tb_caracteristicas",
    columns: ["nombre", "descripcion", "precio", "estado"],
    activeFirst: true,
    paginated: true
  },
  asignacion: {
    table: "tb_asignacion",
    columns: ["servicio_id", "caracteristica_id", "estado"]
  },
  promociones: {
    table: "tb_promociones",
    columns: ["titulo", "descripcion", "fecha_inicio", "fecha_fin", "imagen_url", "estado"],
    activeFirst: true
  },
  trabajos: {
    table: "tb_trabajos",
    columns: ["titulo", "descripcion", "cliente", "fecha_trabajo", "tipo_evento", "estado", "agente_id", "comentarios"]
  }
};

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function getConfig(resource) {
  const key = resourceAliases[resource] || resource;
  const config = tableConfig[key];
  if (!config) {
    throw httpError(404, "Recurso administrativo no permitido.");
  }
  return { key, ...config };
}

function pickAllowed(payload, columns) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw httpError(400, "El cuerpo de la solicitud no es valido.");
  }

  return columns
    .filter((column) => Object.prototype.hasOwnProperty.call(payload, column))
    .map((column) => [column, payload[column] === "" ? null : payload[column]]);
}

function parseId(value, label) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw httpError(400, `${label} es requerido y debe ser valido.`);
  }
  return id;
}

async function assertReference(table, value, label, { activeOnly = false } = {}) {
  const id = parseId(value, label);
  const activeClause = activeOnly ? " AND estado = 'activo'" : "";
  const result = await query(`SELECT id FROM ${table} WHERE id = $1${activeClause} LIMIT 1`, [id]);
  if (!result.rows[0]) {
    const suffix = activeOnly ? " activo" : "";
    throw httpError(400, `${label} no corresponde a un registro${suffix} existente.`);
  }
  return id;
}

function validateDateRange(payload, required) {
  const hasStart = payload.fecha_inicio !== null && payload.fecha_inicio !== undefined && payload.fecha_inicio !== "";
  const hasEnd = payload.fecha_fin !== null && payload.fecha_fin !== undefined && payload.fecha_fin !== "";

  if (required && (!hasStart || !hasEnd)) {
    throw httpError(400, "Fecha de inicio y fecha de fin son requeridas.");
  }
  if (hasStart && hasEnd && String(payload.fecha_fin) < String(payload.fecha_inicio)) {
    throw httpError(400, "La fecha de fin debe ser igual o posterior a la fecha de inicio.");
  }
}

async function validatePayload(resource, payload, { creating = false } = {}) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw httpError(400, "El cuerpo de la solicitud no es valido.");
  }

  if (resource === "trabajos" && (creating || Object.prototype.hasOwnProperty.call(payload, "agente_id"))) {
    payload.agente_id = await assertReference("tb_agentes_modelos", payload.agente_id, "El modelo/agente", { activeOnly: true });
  }

  if (resource === "asignacion") {
    if (creating || Object.prototype.hasOwnProperty.call(payload, "servicio_id")) {
      payload.servicio_id = await assertReference("tb_servicios", payload.servicio_id, "El servicio", { activeOnly: true });
    }
    if (creating || Object.prototype.hasOwnProperty.call(payload, "caracteristica_id")) {
      payload.caracteristica_id = await assertReference("tb_caracteristicas", payload.caracteristica_id, "La caracteristica", { activeOnly: true });
    }
  }

  if (resource === "anuncios") {
    if (creating || Object.prototype.hasOwnProperty.call(payload, "estilo_id")) {
      payload.estilo_id = await assertReference("tb_estilos", payload.estilo_id, "El estilo", { activeOnly: true });
    }
    if (payload.promocion_id !== null && payload.promocion_id !== undefined && payload.promocion_id !== "") {
      payload.promocion_id = await assertReference("tb_promociones", payload.promocion_id, "La promocion");
    } else if (Object.prototype.hasOwnProperty.call(payload, "promocion_id")) {
      payload.promocion_id = null;
    }
    validateDateRange(payload, creating);
  }

  if (resource === "promociones") {
    validateDateRange(payload, creating);
  }
}

function normalizePagination(filters) {
  const page = Math.max(1, Number.parseInt(filters.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, Number.parseInt(filters.limit, 10) || 10));
  return { page, limit, offset: (page - 1) * limit };
}

async function listAssignments(filters) {
  const { page, limit, offset } = normalizePagination(filters);
  const search = typeof filters.q === "string" ? filters.q.trim() : "";
  const values = [];
  const clauses = [];

  if (search) {
    values.push(`%${search}%`);
    clauses.push(`(s.nombre ILIKE $${values.length} OR c.nombre ILIKE $${values.length})`);
  }
  if (filters.estado === "activo" || filters.estado === "inactivo") {
    values.push(filters.estado);
    clauses.push(`a.estado = $${values.length}`);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const countResult = await query(
    `SELECT COUNT(*)::integer AS total
     FROM tb_asignacion a
     JOIN tb_servicios s ON s.id = a.servicio_id
     JOIN tb_caracteristicas c ON c.id = a.caracteristica_id
     ${where}`,
    values
  );

  const pageValues = [...values, limit, offset];
  const nameOrder = filters.orden === "caracteristica" ? "c.nombre" : "s.nombre";
  const rowsResult = await query(
    `SELECT
       a.id,
       a.servicio_id,
       s.nombre AS servicio_nombre,
       a.caracteristica_id,
       c.nombre AS caracteristica_nombre,
       a.estado
     FROM tb_asignacion a
     JOIN tb_servicios s ON s.id = a.servicio_id
     JOIN tb_caracteristicas c ON c.id = a.caracteristica_id
     ${where}
     ORDER BY CASE WHEN a.estado = 'activo' THEN 0 ELSE 1 END, ${nameOrder} ASC, a.id DESC
     LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
    pageValues
  );

  const total = countResult.rows[0].total;
  return {
    data: rowsResult.rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit))
    }
  };
}

async function listStandard(config, filters) {
  const values = [];
  const clauses = [];
  if (filters.estado === "activo" || filters.estado === "inactivo") {
    values.push(filters.estado);
    clauses.push(`estado = $${values.length}`);
  }

  const where = clauses.length ? ` WHERE ${clauses.join(" AND ")}` : "";
  const orderBy = config.activeFirst
    ? "CASE WHEN estado = 'activo' THEN 0 ELSE 1 END, id DESC"
    : "id DESC";
  const shouldPaginate = config.paginated && (filters.page !== undefined || filters.limit !== undefined);

  if (!shouldPaginate) {
    const result = await query(`SELECT * FROM ${config.table}${where} ORDER BY ${orderBy}`, values);
    return result.rows;
  }

  const { page, limit, offset } = normalizePagination(filters);
  const countResult = await query(
    `SELECT COUNT(*)::integer AS total FROM ${config.table}${where}`,
    values
  );
  const result = await query(
    `SELECT * FROM ${config.table}${where}
     ORDER BY ${orderBy}
     LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
    [...values, limit, offset]
  );
  const total = countResult.rows[0].total;

  return {
    data: result.rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit))
    }
  };
}

export async function list(resource, filters = {}) {
  const config = getConfig(resource);
  if (config.key === "asignacion") {
    return listAssignments(filters);
  }

  return listStandard(config, filters);
}

export async function create(resource, payload) {
  const config = getConfig(resource);
  await validatePayload(config.key, payload, { creating: true });
  const entries = pickAllowed(payload, config.columns);
  if (!entries.length) {
    throw httpError(400, "No hay campos validos para crear.");
  }

  const columns = entries.map(([column]) => column);
  const values = entries.map(([, value]) => value);
  const placeholders = values.map((_, index) => `$${index + 1}`);
  const result = await query(
    `INSERT INTO ${config.table} (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`,
    values
  );
  return result.rows[0];
}

export async function update(resource, id, payload) {
  const config = getConfig(resource);
  await validatePayload(config.key, payload);
  const entries = pickAllowed(payload, config.columns);
  if (!entries.length) {
    throw httpError(400, "No hay campos validos para actualizar.");
  }

  const values = entries.map(([, value]) => value);
  const setters = entries.map(([column], index) => `${column} = $${index + 1}`);
  values.push(id);

  const result = await query(
    `UPDATE ${config.table} SET ${setters.join(", ")} WHERE id = $${values.length} RETURNING *`,
    values
  );
  if (!result.rows[0]) {
    throw httpError(404, "Registro no encontrado.");
  }
  return result.rows[0];
}

export async function remove(resource, id) {
  const config = getConfig(resource);
  const result = await query(`DELETE FROM ${config.table} WHERE id = $1 RETURNING *`, [id]);
  if (!result.rows[0]) {
    throw httpError(404, "Registro no encontrado.");
  }
  return result.rows[0];
}

export function normalizeDatabaseError(error) {
  if (error.status) return error;

  if (error.code === "23505") {
    if (error.constraint === "uq_asignacion_servicio_caracteristica") {
      return httpError(409, "El servicio ya tiene asignada esa característica.");
    }
    return httpError(409, "Ya existe un registro con esos datos.");
  }
  if (error.code === "23503") return httpError(400, "La referencia seleccionada no existe.");
  if (error.code === "23502") return httpError(400, "Falta un campo requerido.");
  if (error.code === "23514") return httpError(400, "Los datos no cumplen las reglas del registro.");
  if (["22P02", "22007", "22008"].includes(error.code)) return httpError(400, "Uno de los campos tiene un formato invalido.");

  return error;
}
