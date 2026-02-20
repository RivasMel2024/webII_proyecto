import pool from "../config/database.js";
import { successResponse, errorResponse } from "../utils/responses.js";

export const getTopEmpresas = async (req, res) => {
  try {
    const limit = Number(req.query.limit || 6);
    const connection = await pool.getConnection();

    // Top fijo por códigos
    const topCodes = ["AMA001", "CAN001", "FED001", "MIC001", "SIE001", "MET001"];

    const [rows] = await connection.query(
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
      WHERE e.codigo IN (?,?,?,?,?,?)
      ORDER BY FIELD(e.codigo,'AMA001','CAN001','FED001','MIC001','SIE001','MET001')
      LIMIT ?
      `,
      [...topCodes, limit]
    );

    connection.release();
    return successResponse(res, rows, "Top empresas obtenidas correctamente");
  } catch (error) {
    return errorResponse(res, "Error al obtener top empresas", 500, error.message);
  }
};

export const getAllEmpresas = async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [rows] = await connection.query(
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

    connection.release();
    return successResponse(res, rows, "Empresas obtenidas correctamente");
  } catch (error) {
    return errorResponse(res, "Error al obtener empresas", 500, error.message);
  }
};

export const getEmpresaById = async (req, res) => {
  try {
    const empresaId = Number(req.params.id);
    const connection = await pool.getConnection();

    const [rows] = await connection.query(
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
      WHERE e.id = ?
      `,
      [empresaId]
    );

    connection.release();

    if (!rows.length) return errorResponse(res, "Empresa no encontrada", 404);
    return successResponse(res, rows[0], "Empresa obtenida correctamente");
  } catch (error) {
    return errorResponse(res, "Error al obtener empresa", 500, error.message);
  }
};

export const getOfertasByEmpresa = async (req, res) => {
  try {
    const empresaId = Number(req.params.id);
    const connection = await pool.getConnection();

    const [rows] = await connection.query(
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
      WHERE o.empresa_id = ?
        AND o.estado = 'aprobada'
      ORDER BY o.id DESC
      `,
      [empresaId]
    );

    connection.release();
    return successResponse(res, rows, "Ofertas de la empresa obtenidas correctamente");
  } catch (error) {
    return errorResponse(res, "Error al obtener ofertas de la empresa", 500, error.message);
  }
};