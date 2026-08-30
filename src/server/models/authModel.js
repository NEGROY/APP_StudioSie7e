import { query } from "../config/db.js";

const publicUserColumns = "id, nombre, correo, rol, estado";

export async function findUserByEmail(correo) {
  const result = await query(
    `SELECT ${publicUserColumns}, password_hash
     FROM tb_usuarios
     WHERE correo = $1
     LIMIT 1`,
    [correo]
  );
  return result.rows[0] || null;
}

export async function findActiveUserById(id) {
  const result = await query(
    `SELECT ${publicUserColumns}
     FROM tb_usuarios
     WHERE id = $1 AND estado = 'activo'
     LIMIT 1`,
    [id]
  );
  return result.rows[0] || null;
}
