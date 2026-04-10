import bcrypt from "bcryptjs";
import pool from "../config/database.js";
import { successResponse, errorResponse } from "../utils/responses.js";
import { ROLES } from "../utils/roles.js";

// Devuelve todos los empleados. ADMIN_CUPONERA ve todos; ADMIN_EMPRESA solo los de su empresa.
export const getAllEmpleados = async (req, res) => {
  try {
    const { role, empresaId } = req.user;

    let query = `
      SELECT
        ae.id,
        ae.nombres,
        ae.apellidos,
        ae.correo,
        ae.empresa_id,
        e.nombre AS empresa_nombre,
        ae.activo,
        ae.created_at
      FROM administradores_empresas ae
      JOIN empresas e ON e.id = ae.empresa_id
    `;
    const params = [];

    if (role === ROLES.ADMIN_EMPRESA) {
      query += " WHERE ae.empresa_id = $1";
      params.push(empresaId);
    } else if (req.query.empresa_id) {
      query += " WHERE ae.empresa_id = $1";
      params.push(Number(req.query.empresa_id));
    }

    query += " ORDER BY ae.apellidos ASC, ae.nombres ASC";

    const result = await pool.query(query, params);
    return successResponse(res, result.rows, "Empleados obtenidos correctamente");
  } catch (error) {
    return errorResponse(res, "Error al obtener empleados", 500, error.message);
  }
};

export const getEmpleadoById = async (req, res) => {
  try {
    const empleadoId = Number(req.params.id);
    const { role, empresaId } = req.user;

    const result = await pool.query(
      `SELECT
        ae.id,
        ae.nombres,
        ae.apellidos,
        ae.correo,
        ae.empresa_id,
        e.nombre AS empresa_nombre,
        ae.activo,
        ae.created_at
       FROM administradores_empresas ae
       JOIN empresas e ON e.id = ae.empresa_id
       WHERE ae.id = $1`,
      [empleadoId]
    );

    if (!result.rows.length) return errorResponse(res, "Empleado no encontrado", 404);

    const empleado = result.rows[0];

    // ADMIN_EMPRESA solo puede ver empleados de su empresa
    if (role === ROLES.ADMIN_EMPRESA && empleado.empresa_id !== empresaId) {
      return errorResponse(res, "No autorizado", 403);
    }

    return successResponse(res, empleado, "Empleado obtenido correctamente");
  } catch (error) {
    return errorResponse(res, "Error al obtener empleado", 500, error.message);
  }
};

export const createEmpleado = async (req, res) => {
  try {
    const { nombres, apellidos, correo, password, empresa_id } = req.body;
    const { role, empresaId: authEmpresaId } = req.user;

    if (!nombres || !apellidos || !correo || !password) {
      return errorResponse(res, "nombres, apellidos, correo y password son obligatorios", 400);
    }

    // ADMIN_EMPRESA solo puede crear empleados en su propia empresa
    const targetEmpresaId = role === ROLES.ADMIN_EMPRESA ? authEmpresaId : Number(empresa_id);

    if (!targetEmpresaId) {
      return errorResponse(res, "empresa_id es obligatorio", 400);
    }

    const correoNorm = String(correo).trim().toLowerCase();

    const existe = await pool.query(
      "SELECT id FROM administradores_empresas WHERE correo = $1",
      [correoNorm]
    );
    if (existe.rows.length) return errorResponse(res, "Ya existe un empleado con ese correo", 409);

    const password_hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO administradores_empresas (nombres, apellidos, correo, password_hash, empresa_id, activo)
       VALUES ($1, $2, $3, $4, $5, TRUE)
       RETURNING id, nombres, apellidos, correo, empresa_id, activo, created_at`,
      [nombres.trim(), apellidos.trim(), correoNorm, password_hash, targetEmpresaId]
    );

    return successResponse(res, result.rows[0], "Empleado creado correctamente", 201);
  } catch (error) {
    return errorResponse(res, "Error al crear empleado", 500, error.message);
  }
};

export const updateEmpleado = async (req, res) => {
  try {
    const empleadoId = Number(req.params.id);
    const { nombres, apellidos, correo, activo } = req.body;
    const { role, empresaId } = req.user;

    const existeResult = await pool.query(
      "SELECT id, empresa_id FROM administradores_empresas WHERE id = $1",
      [empleadoId]
    );
    if (!existeResult.rows.length) return errorResponse(res, "Empleado no encontrado", 404);

    // ADMIN_EMPRESA solo puede editar empleados de su empresa
    if (role === ROLES.ADMIN_EMPRESA && existeResult.rows[0].empresa_id !== empresaId) {
      return errorResponse(res, "No autorizado", 403);
    }

    const correoNorm = correo ? String(correo).trim().toLowerCase() : null;

    const result = await pool.query(
      `UPDATE administradores_empresas SET
        nombres   = COALESCE($1, nombres),
        apellidos = COALESCE($2, apellidos),
        correo    = COALESCE($3, correo),
        activo    = COALESCE($4, activo)
       WHERE id = $5
       RETURNING id, nombres, apellidos, correo, empresa_id, activo, created_at`,
      [nombres ?? null, apellidos ?? null, correoNorm, activo ?? null, empleadoId]
    );

    return successResponse(res, result.rows[0], "Empleado actualizado correctamente");
  } catch (error) {
    return errorResponse(res, "Error al actualizar empleado", 500, error.message);
  }
};

export const deleteEmpleado = async (req, res) => {
  try {
    const empleadoId = Number(req.params.id);
    const { role, empresaId } = req.user;

    const existeResult = await pool.query(
      "SELECT id, empresa_id FROM administradores_empresas WHERE id = $1",
      [empleadoId]
    );
    if (!existeResult.rows.length) return errorResponse(res, "Empleado no encontrado", 404);

    // ADMIN_EMPRESA solo puede eliminar empleados de su empresa
    if (role === ROLES.ADMIN_EMPRESA && existeResult.rows[0].empresa_id !== empresaId) {
      return errorResponse(res, "No autorizado", 403);
    }

    // Soft delete: desactivar para no romper historial de canjes
    await pool.query("UPDATE administradores_empresas SET activo = FALSE WHERE id = $1", [empleadoId]);

    return successResponse(res, null, "Empleado desactivado correctamente");
  } catch (error) {
    return errorResponse(res, "Error al eliminar empleado", 500, error.message);
  }
};
