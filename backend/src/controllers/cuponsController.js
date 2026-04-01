import pool from '../config/database.js';
import { successResponse, errorResponse } from '../utils/responses.js';
import { sendEmail } from '../services/mailer.js';

/**
 * Obtener todos los cupones
 */
export const getAllCoupons = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cupones');
    
    successResponse(res, result.rows, 'Cupones obtenidos correctamente');
  } catch (error) {
    errorResponse(res, 'Error al obtener cupones', 500, error.message);
  }
};

/**
 * Obtener cupón por ID
 */
export const getCouponById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM cupones WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return errorResponse(res, 'Cupón no encontrado', 404);
    }
    
    successResponse(res, result.rows[0], 'Cupón obtenido correctamente');
  } catch (error) {
    errorResponse(res, 'Error al obtener cupón', 500, error.message);
  }
}; 

/**
 * Crear nuevo cupón
 */
export const createCoupon = async (req, res) => {
  try {
    return errorResponse(
      res,
      'Endpoint no disponible. La compra de cupones se realiza con POST /api/cupones/comprar',
      501
    );
  } catch (error) {
    errorResponse(res, 'Error al crear cupón', 500, error.message);
  }
};

/**
 * Actualizar cupón
 */
export const updateCoupon = async (req, res) => {
  try {
    return errorResponse(res, 'Endpoint no disponible', 501);
  } catch (error) {
    errorResponse(res, 'Error al actualizar cupón', 500, error.message);
  }
};

/**
 * Eliminar cupón
 */
export const deleteCoupon = async (req, res) => {
  try {
    return errorResponse(res, 'Usa DELETE /api/cupones/:id', 410);
  } catch (error) {
    errorResponse(res, 'Error al eliminar cupón', 500, error.message);
  }
};

/**
 * Obtener cupones de un cliente (por cliente_id)
 * 
 */
export const getCuponesByCliente = async (req, res) => {
  try {
    const { clienteId } = req.params;

    const result = await pool.query(
      `SELECT 
          id, codigo, estado, precio_pagado, fecha_compra, fecha_canje,
          oferta_titulo, oferta_descripcion, fecha_limite_uso,
          empresa_nombre, empresa_direccion, empresa_telefono
       FROM v_cupones_clientes
       WHERE cliente_id = $1
       ORDER BY fecha_compra DESC`,
      [clienteId]
    );

    return successResponse(res, result.rows, 'Cupones del cliente obtenidos correctamente');
  } catch (error) {
    return errorResponse(res, 'Error al obtener cupones del cliente', 500, error.message);
  }
};

// Eliminar cupón por ID (para uso interno, no expuesto en rutas públicas)
export const deleteCupon = async (req, res) => {
  try {
    const { id } = req.params;
    const cuponId = Number(id);

    if (!cuponId) {
      return res.status(400).json({
        success: false,
        message: "ID de cupón inválido",
      });
    }

    const result = await pool.query(
      "DELETE FROM cupones WHERE id = $1",
      [cuponId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Cupón no encontrado",
      });
    }

    return res.json({
      success: true,
      message: "Cupón eliminado correctamente",
    });

  } catch (error) {
    console.error("deleteCupon error:", error);
    return res.status(500).json({
      success: false,
      message: "Error al eliminar cupón",
    });
  }
};

/**
 * Comprar uno o varios cupones (CLIENTE)
 * Body: { ofertaId, cantidad?, tarjeta? }
 */
export const comprarCupon = async (req, res) => {
  try {
    const clienteId = req.user?.id;
    const ofertaId = Number(req.body.ofertaId);
    const cantidad = Number(req.body.cantidad || 1);
    const tarjeta = req.body.tarjeta || {};

    if (!clienteId) return errorResponse(res, 'No autenticado', 401);
    if (!ofertaId) return errorResponse(res, 'ofertaId es requerido', 400);
    if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > 20) {
      return errorResponse(res, 'cantidad inválida (1-20)', 400);
    }

    // Pago simulado: validación mínima
    if (tarjeta && Object.keys(tarjeta).length) {
      const numero = String(tarjeta.numero || '').replace(/\s+/g, '');
      const cvv = String(tarjeta.cvv || '').trim();
      if (numero.length < 13 || numero.length > 19) return errorResponse(res, 'Tarjeta inválida', 400);
      if (cvv.length < 3 || cvv.length > 4) return errorResponse(res, 'CVV inválido', 400);
    }

    const client = await pool.connect();
    try {
      const ofertaRows = await client.query('SELECT id, precio_oferta, titulo FROM ofertas WHERE id = $1 LIMIT 1', [ofertaId]);
      if (!ofertaRows.rows.length) return errorResponse(res, 'Oferta no encontrada', 404);

      const precioPagado = ofertaRows.rows[0].precio_oferta;
      const codigos = [];

      for (let i = 0; i < cantidad; i += 1) {
        // PostgreSQL: llamar función que retorna JSON
        const outRows = await client.query('SELECT sp_comprar_cupon($1, $2, $3) AS resultado', [ofertaId, clienteId, precioPagado]);
        const resultado = outRows.rows[0]?.resultado;

        if (!resultado?.codigo_cupon) {
          return errorResponse(res, resultado?.mensaje || 'No fue posible completar la compra', 400);
        }
        codigos.push(resultado.codigo_cupon);
      }

      const clienteRows = await client.query('SELECT correo FROM clientes WHERE id = $1 LIMIT 1', [clienteId]);
      const correo = clienteRows.rows[0]?.correo;

      if (correo) {
        const texto = `Compra confirmada. Oferta: ${ofertaRows.rows[0].titulo}. Códigos: ${codigos.join(', ')}`;
        await sendEmail({
          to: correo,
          subject: 'Confirmación de compra - CuponX',
          text: texto,
          html: `<p>${texto}</p>`,
        });
      }

      return successResponse(res, { codigos }, 'Compra realizada correctamente', 201);
    } finally {
      client.release();
    }
  } catch (error) {
    return errorResponse(res, 'Error al comprar cupón', 500, error.message);
  }
};

/**
 * Canjear cupón (EMPLEADO)
 * Body: { codigoCupon, duiPresentado }
 */
export const canjearCupon = async (req, res) => {
  try {
    const empleadoId = req.user?.id;
    const empresaId = req.user?.empresaId;
    const codigoCupon = String(req.body.codigoCupon || '').trim();
    const duiPresentado = String(req.body.duiPresentado || '').trim();

    if (!empleadoId || !empresaId) return errorResponse(res, 'No autenticado', 401);
    if (!codigoCupon || !duiPresentado) {
      return errorResponse(res, 'codigoCupon y duiPresentado son requeridos', 400);
    }

    const client = await pool.connect();
    try {
      // Verificar que el cupón pertenezca a la empresa del empleado
      const scopeRows = await client.query(
        `SELECT o.empresa_id
         FROM cupones c
         INNER JOIN ofertas o ON c.oferta_id = o.id
         WHERE c.codigo = $1
         LIMIT 1`,
        [codigoCupon]
      );

      if (!scopeRows.rows.length) return errorResponse(res, 'El cupón no existe', 404);
      if (Number(scopeRows.rows[0].empresa_id) !== Number(empresaId)) {
        return errorResponse(res, 'Cupón no pertenece a tu empresa', 403);
      }

      // PostgreSQL: llamar función que retorna JSON
      const outRows = await client.query(
        'SELECT sp_canjear_cupon($1, $2, $3) AS resultado',
        [codigoCupon, duiPresentado, empleadoId]
      );
      const resultado = outRows.rows[0]?.resultado;

      if (!resultado?.valido) {
        return errorResponse(res, resultado?.mensaje || 'No se pudo canjear', 400);
      }

      return successResponse(res, { codigo: codigoCupon }, resultado.mensaje || 'Cupón canjeado', 200);
    } finally {
      client.release();
    }
  } catch (error) {
    return errorResponse(res, 'Error al canjear cupón', 500, error.message);
  }
};
