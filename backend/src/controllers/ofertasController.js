import pool from "../config/database.js";
import { successResponse, errorResponse } from "../utils/responses.js";

// Home: Top ofertas para vender (aunque nadie haya comprado)
export const getTopOffers = async (req, res) => {
  try {
    const limit = Number(req.query.limit || 6);

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
        COUNT(c.id) AS vendidos
      FROM ofertas o
      LEFT JOIN cupones c ON c.oferta_id = o.id
      WHERE o.estado = 'aprobada'
        AND CURRENT_DATE BETWEEN o.fecha_inicio_oferta AND o.fecha_fin_oferta
      GROUP BY
        o.id, o.titulo, o.descripcion, o.precio_regular, o.precio_oferta, o.fecha_limite_uso
      ORDER BY vendidos DESC, descuento_pct DESC
      LIMIT $1
      `,
      [limit]
    );

    return successResponse(res, result.rows, "Top ofertas obtenidas correctamente");
  } catch (error) {
    return errorResponse(res, "Error al obtener top ofertas", 500, error.message);
  }
};

export const getAllOffers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        o.id AS oferta_id,
        o.titulo,
        o.descripcion,
        o.precio_regular,
        o.precio_oferta,
        ROUND((1 - (o.precio_oferta / NULLIF(o.precio_regular,0))) * 100) AS descuento_pct,
        o.fecha_limite_uso,
        o.estado
      FROM ofertas o
      WHERE o.estado = 'aprobada'
      ORDER BY o.id DESC
    `);

    return successResponse(res, result.rows, "Ofertas obtenidas correctamente");
  } catch (error) {
    return errorResponse(res, "Error al obtener ofertas", 500, error.message);
  }
};

// ============================================================
// Funciones para buscar por rubro o palabra clave
// ============================================================

/**
 * Obtiene ofertas vigentes con filtros opcionales
 * - ver la oferta esté aprobada
 * - ver que este en fechas validas
 * - valida que NO se haya agotado
 * - filtrar por rubro
 * - busca por palabra clave
 *
 * Query params:
 *   - rubro_id: ID del rubro (opcional)
 *   - search: Palabra clave para buscar (opcional)
 */
export const getOfertasVigentes = async (req, res) => {
  try {
    const { rubro_id, search } = req.query;

    // Construir query dinámicamente
    let query = `
      SELECT
        o.id AS oferta_id,
        o.titulo,
        o.descripcion,
        o.precio_regular,
        o.precio_oferta,
        o.fecha_limite_uso,
        o.cantidad_limite,
        o.imagen_url,
        ROUND((1 - (o.precio_oferta / NULLIF(o.precio_regular, 0))) * 100) AS descuento_pct,
        e.id AS empresa_id,
        e.nombre AS empresa_nombre,
        e.codigo AS empresa_codigo,
        r.id AS rubro_id,
        r.nombre AS rubro_nombre,
        COUNT(c.id) AS cupones_vendidos,
        CASE
          WHEN o.cantidad_limite IS NULL THEN NULL
          ELSE (o.cantidad_limite - COUNT(c.id))
        END AS cupones_disponibles
      FROM ofertas o
      INNER JOIN empresas e ON o.empresa_id = e.id

      -- ✅ CAMBIO CLAVE: usa rubro de la OFERTA si existe, si no usa rubro de la EMPRESA
      INNER JOIN rubros r ON r.id = COALESCE(o.rubro_id, e.rubro_id)

      LEFT JOIN cupones c ON c.oferta_id = o.id
      WHERE o.estado = 'aprobada'
        AND CURRENT_DATE BETWEEN o.fecha_inicio_oferta AND o.fecha_fin_oferta
    `;

    const params = [];
    let paramIndex = 1;

    // Filtro por rubro
    if (rubro_id) {
      query += ` AND r.id = $${paramIndex}`;
      params.push(rubro_id);
      paramIndex++;
    }

    // Filtro por búsqueda (título de oferta o nombre de empresa)
    if (search) {
      query += ` AND (o.titulo ILIKE $${paramIndex} OR e.nombre ILIKE $${paramIndex + 1})`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
      paramIndex += 2;
    }

    query += `
      GROUP BY
        o.id, o.titulo, o.descripcion, o.precio_regular, o.precio_oferta,
        o.fecha_limite_uso, o.cantidad_limite, o.imagen_url,
        e.id, e.nombre, e.codigo, r.id, r.nombre
      HAVING
        (o.cantidad_limite IS NULL OR COUNT(c.id) < o.cantidad_limite)
      ORDER BY cupones_vendidos DESC, descuento_pct DESC
    `;

    const result = await pool.query(query, params);

    return successResponse(res, result.rows, "Ofertas vigentes obtenidas correctamente");
  } catch (error) {
    return errorResponse(res, "Error al obtener ofertas vigentes", 500, error.message);
  }
};