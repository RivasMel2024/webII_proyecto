import pool from "../config/database.js";
import { successResponse, errorResponse } from "../utils/responses.js";

const ESTADOS = {
  EN_ESPERA: "en_espera",
  APROBADA: "aprobada",
  RECHAZADA: "rechazada",
  DESCARTADA: "descartada",
};

const parsePositiveNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const parseDateOnly = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
};

const normalizeText = (value) => String(value || "").trim();

const getOfertaById = async (id) => {
  const result = await pool.query(
    `SELECT id, empresa_id, estado, razon_rechazo
     FROM ofertas
     WHERE id = $1
     LIMIT 1`,
    [id]
  );
  return result.rows[0] || null;
};

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
        o.imagen_url,
        ROUND((1 - (o.precio_oferta / NULLIF(o.precio_regular,0))) * 100) AS descuento_pct,
        o.fecha_limite_uso,
        COUNT(c.id) AS vendidos
      FROM ofertas o
      LEFT JOIN cupones c ON c.oferta_id = o.id
      WHERE o.estado = 'aprobada'
        AND CURRENT_DATE BETWEEN o.fecha_inicio_oferta AND o.fecha_fin_oferta
      GROUP BY
        o.id, o.titulo, o.descripcion, o.precio_regular, o.precio_oferta, o.fecha_limite_uso, o.imagen_url
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
        o.imagen_url,
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

      INNER JOIN rubros r ON r.id = e.rubro_id

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

/**
 * Crear oferta (ADMIN_EMPRESA)
 */
export const createOferta = async (req, res) => {
  try {
    const empresaId = req.user?.id;
    if (!empresaId) return errorResponse(res, "No autenticado", 401);

    const titulo = normalizeText(req.body.titulo);
    const descripcion = normalizeText(req.body.descripcion);
    const otrosDetalles = normalizeText(req.body.otros_detalles) || null;
    const imagenUrl = normalizeText(req.body.imagen_url) || null;

    const precioRegular = parsePositiveNumber(req.body.precio_regular);
    const precioOferta = parsePositiveNumber(req.body.precio_oferta);
    const cantidadLimiteRaw = req.body.cantidad_limite;
    const cantidadLimite =
      cantidadLimiteRaw === null || cantidadLimiteRaw === undefined || cantidadLimiteRaw === ""
        ? null
        : Number(cantidadLimiteRaw);

    const fechaInicio = parseDateOnly(req.body.fecha_inicio_oferta);
    const fechaFin = parseDateOnly(req.body.fecha_fin_oferta);
    const fechaLimiteUso = parseDateOnly(req.body.fecha_limite_uso);

    if (!titulo || !descripcion) {
      return errorResponse(res, "titulo y descripcion son requeridos", 400);
    }

    if (!precioRegular || !precioOferta || precioRegular <= 0 || precioOferta <= 0) {
      return errorResponse(res, "precio_regular y precio_oferta deben ser mayores a 0", 400);
    }

    if (precioOferta >= precioRegular) {
      return errorResponse(res, "precio_oferta debe ser menor que precio_regular", 400);
    }

    if (!fechaInicio || !fechaFin || !fechaLimiteUso) {
      return errorResponse(
        res,
        "fecha_inicio_oferta, fecha_fin_oferta y fecha_limite_uso son requeridas",
        400
      );
    }

    if (fechaInicio > fechaFin) {
      return errorResponse(res, "fecha_inicio_oferta debe ser menor o igual que fecha_fin_oferta", 400);
    }

    if (fechaLimiteUso < fechaFin) {
      return errorResponse(res, "fecha_limite_uso debe ser mayor o igual que fecha_fin_oferta", 400);
    }

    if (cantidadLimite !== null && (!Number.isInteger(cantidadLimite) || cantidadLimite <= 0)) {
      return errorResponse(res, "cantidad_limite debe ser un entero mayor que 0", 400);
    }

    const insert = await pool.query(
      `INSERT INTO ofertas (
         empresa_id,
         titulo,
         precio_regular,
         precio_oferta,
         fecha_inicio_oferta,
         fecha_fin_oferta,
         fecha_limite_uso,
         cantidad_limite,
         descripcion,
         otros_detalles,
         imagen_url,
         estado
       )
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING id, empresa_id, titulo, estado, fecha_inicio_oferta, fecha_fin_oferta, fecha_limite_uso`,
      [
        empresaId,
        titulo,
        precioRegular,
        precioOferta,
        req.body.fecha_inicio_oferta,
        req.body.fecha_fin_oferta,
        req.body.fecha_limite_uso,
        cantidadLimite,
        descripcion,
        otrosDetalles,
        imagenUrl,
        ESTADOS.EN_ESPERA,
      ]
    );

    return successResponse(res, insert.rows[0], "Oferta creada en espera de aprobación", 201);
  } catch (error) {
    return errorResponse(res, "Error al crear oferta", 500, error.message);
  }
};

/**
 * Aprobar oferta (ADMIN_CUPONERA)
 */
export const aprobarOferta = async (req, res) => {
  try {
    const ofertaId = Number(req.params.id);
    const adminId = req.user?.id;

    if (!ofertaId) return errorResponse(res, "ID de oferta inválido", 400);

    const oferta = await getOfertaById(ofertaId);
    if (!oferta) return errorResponse(res, "Oferta no encontrada", 404);
    if (oferta.estado !== ESTADOS.EN_ESPERA) {
      return errorResponse(res, "Transición inválida: solo se puede aprobar ofertas en espera", 409);
    }

    const result = await pool.query(
      `UPDATE ofertas
       SET estado = $1,
           razon_rechazo = NULL,
           revisada_por = $2,
           fecha_revision = NOW()
       WHERE id = $3
       RETURNING id, estado, revisada_por, fecha_revision`,
      [ESTADOS.APROBADA, adminId, ofertaId]
    );

    return successResponse(res, result.rows[0], "Oferta aprobada correctamente");
  } catch (error) {
    return errorResponse(res, "Error al aprobar oferta", 500, error.message);
  }
};

/**
 * Rechazar oferta (ADMIN_CUPONERA)
 */
export const rechazarOferta = async (req, res) => {
  try {
    const ofertaId = Number(req.params.id);
    const adminId = req.user?.id;
    const justificacion = normalizeText(req.body.justificacion);

    if (!ofertaId) return errorResponse(res, "ID de oferta inválido", 400);
    if (!justificacion) {
      return errorResponse(res, "justificacion es requerida para rechazar una oferta", 400);
    }

    const oferta = await getOfertaById(ofertaId);
    if (!oferta) return errorResponse(res, "Oferta no encontrada", 404);
    if (oferta.estado !== ESTADOS.EN_ESPERA) {
      return errorResponse(res, "Transición inválida: solo se puede rechazar ofertas en espera", 409);
    }

    const result = await pool.query(
      `UPDATE ofertas
       SET estado = $1,
           razon_rechazo = $2,
           revisada_por = $3,
           fecha_revision = NOW()
       WHERE id = $4
       RETURNING id, estado, razon_rechazo, revisada_por, fecha_revision`,
      [ESTADOS.RECHAZADA, justificacion, adminId, ofertaId]
    );

    return successResponse(res, result.rows[0], "Oferta rechazada correctamente");
  } catch (error) {
    return errorResponse(res, "Error al rechazar oferta", 500, error.message);
  }
};

/**
 * Reenviar oferta rechazada (ADMIN_EMPRESA dueño)
 */
export const reenviarOferta = async (req, res) => {
  try {
    const ofertaId = Number(req.params.id);
    const empresaId = req.user?.id;

    if (!ofertaId) return errorResponse(res, "ID de oferta inválido", 400);

    const oferta = await getOfertaById(ofertaId);
    if (!oferta) return errorResponse(res, "Oferta no encontrada", 404);
    if (Number(oferta.empresa_id) !== Number(empresaId)) {
      return errorResponse(res, "No autorizado para modificar esta oferta", 403);
    }
    if (oferta.estado !== ESTADOS.RECHAZADA) {
      return errorResponse(res, "Transición inválida: solo se puede reenviar ofertas rechazadas", 409);
    }

    const result = await pool.query(
      `UPDATE ofertas
       SET estado = $1,
           razon_rechazo = NULL,
           revisada_por = NULL,
           fecha_revision = NULL
       WHERE id = $2
       RETURNING id, estado`,
      [ESTADOS.EN_ESPERA, ofertaId]
    );

    return successResponse(res, result.rows[0], "Oferta reenviada para nueva revisión");
  } catch (error) {
    return errorResponse(res, "Error al reenviar oferta", 500, error.message);
  }
};

/**
 * Descartar oferta rechazada (ADMIN_EMPRESA dueño)
 */
export const descartarOferta = async (req, res) => {
  try {
    const ofertaId = Number(req.params.id);
    const empresaId = req.user?.id;

    if (!ofertaId) return errorResponse(res, "ID de oferta inválido", 400);

    const oferta = await getOfertaById(ofertaId);
    if (!oferta) return errorResponse(res, "Oferta no encontrada", 404);
    if (Number(oferta.empresa_id) !== Number(empresaId)) {
      return errorResponse(res, "No autorizado para modificar esta oferta", 403);
    }
    if (oferta.estado !== ESTADOS.RECHAZADA) {
      return errorResponse(res, "Transición inválida: solo se puede descartar ofertas rechazadas", 409);
    }

    const result = await pool.query(
      `UPDATE ofertas
       SET estado = $1
       WHERE id = $2
       RETURNING id, estado`,
      [ESTADOS.DESCARTADA, ofertaId]
    );

    return successResponse(res, result.rows[0], "Oferta descartada correctamente");
  } catch (error) {
    return errorResponse(res, "Error al descartar oferta", 500, error.message);
  }
};

/**
 * Listado de ofertas por empresa autenticada (ADMIN_EMPRESA)
 */
export const getMisOfertas = async (req, res) => {
  try {
    const empresaId = req.user?.id;
    const estado = normalizeText(req.query.estado);
    const allowedEstados = new Set(Object.values(ESTADOS));

    const params = [empresaId];
    let where = "WHERE o.empresa_id = $1";

    if (estado) {
      if (!allowedEstados.has(estado)) {
        return errorResponse(res, "estado inválido", 400);
      }
      params.push(estado);
      where += ` AND o.estado = $${params.length}`;
    }

    const result = await pool.query(
      `SELECT
         o.id,
         o.titulo,
         o.descripcion,
         o.precio_regular,
         o.precio_oferta,
         o.imagen_url,
         o.fecha_inicio_oferta,
         o.fecha_fin_oferta,
         o.fecha_limite_uso,
         o.cantidad_limite,
         o.estado,
         o.razon_rechazo,
         o.fecha_revision,
         o.created_at,
         COUNT(c.id) AS cupones_vendidos
       FROM ofertas o
       LEFT JOIN cupones c ON c.oferta_id = o.id
       ${where}
       GROUP BY o.id, o.imagen_url
       ORDER BY o.created_at DESC`,
      params
    );

    return successResponse(res, result.rows, "Ofertas de la empresa obtenidas correctamente");
  } catch (error) {
    return errorResponse(res, "Error al obtener ofertas de la empresa", 500, error.message);
  }
};

/**
 * Gestión de Ofertas (Aprobar/Rechazar)
 */
export const getOfertasByEstado = async (req, res) => {
  try {
    const { estado } = req.params; // 'en_espera', 'aprobada', etc.
    const { rows } = await pool.query(
      `SELECT o.*, e.nombre as empresa_nombre 
       FROM ofertas o 
       JOIN empresas e ON o.empresa_id = e.id 
       WHERE o.estado = $1 
       ORDER BY o.created_at DESC`,
      [estado]
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al obtener ofertas" });
  }
};

export const getOfertasAdmin = async (req, res) => {
  try {
    const { estado } = req.query; // Para filtrar desde el dashboard
    let query = `
      SELECT o.*, e.nombre as empresa_nombre, r.nombre as rubro_nombre
      FROM ofertas o
      JOIN empresas e ON o.empresa_id = e.id
      JOIN rubros r ON o.rubro_id = r.id
    `;
    
    const params = [];
    if (estado) {
      query += ` WHERE o.estado = $1`;
      params.push(estado);
    }
    
    query += ` ORDER BY o.created_at DESC`;
    
    const { rows } = await pool.query(query, params);
    return successResponse(res, rows, "Ofertas obtenidas para administración");
  } catch (error) {
    return errorResponse(res, "Error al obtener ofertas", 500, error.message);
  }
};

// función para cambiar el estado
export const revisarOferta = async (req, res) => {
  const { id } = req.params;
  const { estado, razon_rechazo } = req.body; // estado: 'aprobada' o 'rechazada'
  
  try {
    const { rows } = await pool.query(
      `UPDATE ofertas 
       SET estado = $1, razon_rechazo = $2, fecha_revision = NOW() 
       WHERE id = $3 RETURNING *`,
      [estado, razon_rechazo || null, id]
    );
    return successResponse(res, rows[0], `Oferta ${estado} correctamente`);
  } catch (error) {
    return errorResponse(res, "Error al revisar oferta", 500, error.message);
  }
};