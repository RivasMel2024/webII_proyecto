import bcrypt from "bcryptjs";
import pool from "../config/database.js";
import { successResponse, errorResponse } from "../utils/responses.js";

export const getTopEmpresas = async (req, res) => {
  try {
    const limit = Number(req.query.limit || 6);

    // Top fijo por códigos
    const topCodes = ["AMA001", "CAN001", "FED001", "MIC001", "SIE001", "MET001"];

    const result = await pool.query(
      `
      SELECT
        e.id,
        e.nombre,
        e.codigo,
        e.color_hex,
        e.descripcion,
        e.reward_pct,
        r.nombre AS rubro_nombre
      FROM empresas e
      JOIN rubros r ON r.id = e.rubro_id
      WHERE e.codigo = ANY($1::varchar[])
      ORDER BY 
        CASE e.codigo
          WHEN 'AMA001' THEN 1
          WHEN 'CAN001' THEN 2
          WHEN 'FED001' THEN 3
          WHEN 'MIC001' THEN 4
          WHEN 'SIE001' THEN 5
          WHEN 'MET001' THEN 6
        END
      LIMIT $2
      `,
      [topCodes, limit]
    );

    return successResponse(res, result.rows, "Top empresas obtenidas correctamente");
  } catch (error) {
    return errorResponse(res, "Error al obtener top empresas", 500, error.message);
  }
};

export const getAllEmpresas = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        e.id,
        e.nombre,
        e.codigo,
        e.color_hex,
        e.descripcion,
        e.reward_pct,
        r.nombre AS rubro_nombre
      FROM empresas e
      JOIN rubros r ON r.id = e.rubro_id
      ORDER BY e.nombre ASC
      `
    );

    return successResponse(res, result.rows, "Empresas obtenidas correctamente");
  } catch (error) {
    return errorResponse(res, "Error al obtener empresas", 500, error.message);
  }
};

export const getEmpresaById = async (req, res) => {
  try {
    const empresaId = Number(req.params.id);

    const result = await pool.query(
      `
      SELECT
        e.id,
        e.nombre,
        e.codigo,
        e.direccion,
        e.telefono,
        e.correo,
        e.color_hex,
        e.descripcion,
        e.reward_pct,
        r.nombre AS rubro_nombre
      FROM empresas e
      JOIN rubros r ON r.id = e.rubro_id
      WHERE e.id = $1
      `,
      [empresaId]
    );

    if (!result.rows.length) return errorResponse(res, "Empresa no encontrada", 404);
    return successResponse(res, result.rows[0], "Empresa obtenida correctamente");
  } catch (error) {
    return errorResponse(res, "Error al obtener empresa", 500, error.message);
  }
};

export const getOfertasByEmpresa = async (req, res) => {
  try {
    const empresaId = Number(req.params.id);

    const result = await pool.query(
      `
      SELECT
        o.id AS oferta_id,
        o.titulo,
        o.descripcion,
        o.precio_regular,
        o.precio_oferta,
        ROUND((1 - (o.precio_oferta / NULLIF(o.precio_regular,0))) * 100) AS descuento_pct,
        o.fecha_limite_uso,
        o.imagen_url
      FROM ofertas o
      WHERE o.empresa_id = $1
        AND o.estado = 'aprobada'
      ORDER BY o.id DESC
      `,
      [empresaId]
    );

    return successResponse(res, result.rows, "Ofertas de la empresa obtenidas correctamente");
  } catch (error) {
    return errorResponse(res, "Error al obtener ofertas de la empresa", 500, error.message);
  }
};

export const createEmpresa = async (req, res) => {
  try {
    const { nombre, codigo, color_hex, descripcion, reward_pct, rubro_id, direccion, telefono, correo, password } = req.body;

    if (!nombre || !codigo || !rubro_id || !correo || !password) {
      return errorResponse(res, "nombre, codigo, rubro_id, correo y password son obligatorios", 400);
    }

    const existe = await pool.query("SELECT id FROM empresas WHERE codigo = $1 OR correo = $2", [codigo, correo]);
    if (existe.rows.length) {
      return errorResponse(res, "Ya existe una empresa con ese código o correo", 409);
    }

    const password_hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO empresas (nombre, codigo, color_hex, descripcion, reward_pct, rubro_id, direccion, telefono, correo, password_hash, activo)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, TRUE)
       RETURNING id, nombre, codigo, color_hex, descripcion, reward_pct, rubro_id, direccion, telefono, correo, activo`,
      [nombre, codigo, color_hex || null, descripcion || null, reward_pct || 0, rubro_id, direccion || null, telefono || null, correo, password_hash]
    );

    return successResponse(res, result.rows[0], "Empresa creada correctamente", 201);
  } catch (error) {
    return errorResponse(res, "Error al crear empresa", 500, error.message);
  }
};

export const updateEmpresa = async (req, res) => {
  try {
    const empresaId = Number(req.params.id);
    const { nombre, codigo, color_hex, descripcion, reward_pct, rubro_id, direccion, telefono, correo, activo } = req.body;

    const existe = await pool.query("SELECT id FROM empresas WHERE id = $1", [empresaId]);
    if (!existe.rows.length) return errorResponse(res, "Empresa no encontrada", 404);

    const result = await pool.query(
      `UPDATE empresas SET
        nombre      = COALESCE($1, nombre),
        codigo      = COALESCE($2, codigo),
        color_hex   = COALESCE($3, color_hex),
        descripcion = COALESCE($4, descripcion),
        reward_pct  = COALESCE($5, reward_pct),
        rubro_id    = COALESCE($6, rubro_id),
        direccion   = COALESCE($7, direccion),
        telefono    = COALESCE($8, telefono),
        correo      = COALESCE($9, correo),
        activo      = COALESCE($10, activo)
       WHERE id = $11
       RETURNING id, nombre, codigo, color_hex, descripcion, reward_pct, rubro_id, direccion, telefono, correo, activo`,
      [nombre, codigo, color_hex, descripcion, reward_pct, rubro_id, direccion, telefono, correo, activo, empresaId]
    );

    return successResponse(res, result.rows[0], "Empresa actualizada correctamente");
  } catch (error) {
    return errorResponse(res, "Error al actualizar empresa", 500, error.message);
  }
};

export const deleteEmpresa = async (req, res) => {
  try {
    const empresaId = Number(req.params.id);

    const existe = await pool.query("SELECT id FROM empresas WHERE id = $1", [empresaId]);
    if (!existe.rows.length) return errorResponse(res, "Empresa no encontrada", 404);

    // Soft delete: desactivar en lugar de eliminar para no romper FKs
    await pool.query("UPDATE empresas SET activo = FALSE WHERE id = $1", [empresaId]);

    return successResponse(res, null, "Empresa desactivada correctamente");
  } catch (error) {
    return errorResponse(res, "Error al eliminar empresa", 500, error.message);
  }
};