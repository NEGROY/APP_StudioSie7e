import { query } from "../config/db.js";

export async function getServicesCatalog() {
  const result = await query(`
    SELECT
      s.id,
      s.nombre,
      s.precio,
      s.descripcion,
      COALESCE(
        json_agg(
          json_build_object(
            'id', c.id,
            'nombre', c.nombre,
            'descripcion', c.descripcion,
            'precio', c.precio
          )
        ) FILTER (WHERE c.id IS NOT NULL),
        '[]'
      ) AS caracteristicas
    FROM tb_servicios s
    LEFT JOIN tb_asignacion a ON a.servicio_id = s.id AND a.estado = 'activo'
    LEFT JOIN tb_caracteristicas c ON c.id = a.caracteristica_id AND c.estado = 'activo'
    WHERE s.estado = 'activo'
    GROUP BY s.id
    ORDER BY s.id ASC
  `);
  return result.rows;
}

export async function getActivePromotions() {
  const result = await query(
    `
      SELECT *
      FROM tb_promociones
      WHERE estado = 'activo'
        AND fecha_inicio <= CURRENT_DATE
        AND fecha_fin >= CURRENT_DATE
      ORDER BY fecha_inicio DESC
    `
  );
  return result.rows;
}

export async function getActiveAnnouncements() {
  const result = await query(`
    SELECT
      a.id,
      a.titulo,
      a.descripcion,
      a.estilo_id,
      e.nombre AS estilo_nombre,
      a.fecha_inicio,
      a.fecha_fin,
      a.imagen_url,
      a.estado,
      a.promocion_id
    FROM tb_anuncios a
    LEFT JOIN tb_estilos e ON e.id = a.estilo_id
    WHERE a.estado = 'activo'
      AND a.fecha_inicio <= CURRENT_DATE
      AND a.fecha_fin >= CURRENT_DATE
    ORDER BY a.fecha_inicio DESC, a.id DESC
  `);
  return result.rows;
}
