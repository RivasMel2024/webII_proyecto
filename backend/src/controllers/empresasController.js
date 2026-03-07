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