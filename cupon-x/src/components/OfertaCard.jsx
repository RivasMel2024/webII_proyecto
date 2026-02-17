import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { FaCalendarAlt, FaStore, FaTag, FaCheckCircle } from 'react-icons/fa';

/**
 * Componente OfertaCard - Tarjeta individual para mostrar ofertas vigentes
 * 
 * @param {Object} oferta - Datos de la oferta desde la API
 * @param {number} oferta.oferta_id - ID de la oferta
 * @param {string} oferta.titulo - Título de la oferta
 * @param {string} oferta.descripcion - Descripción detallada
 * @param {number} oferta.precio_regular - Precio sin descuento
 * @param {number} oferta.precio_oferta - Precio con descuento
 * @param {number} oferta.descuento_pct - Porcentaje de descuento
 * @param {string} oferta.empresa_nombre - Nombre de la empresa
 * @param {string} oferta.rubro_nombre - Categoría/Rubro
 * @param {string} oferta.fecha_limite_uso - Fecha límite para usar el cupón
 * @param {number} oferta.cupones_disponibles - Cupones restantes (null si ilimitado)
 */
const OfertaCard = ({ oferta }) => {
  // Formatear fecha
  const formatFecha = (fecha) => {
    if (!fecha) return '—';
    const date = new Date(fecha);
    if (isNaN(date.getTime())) return String(fecha);
    return date.toLocaleDateString('es-SV', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Formatear precio
  const formatPrecio = (precio) => {
    const num = Number(precio);
    if (isNaN(num)) return '$0.00';
    return `$${num.toFixed(2)}`;
  };

  // Determinar si hay cupones disponibles
  const tieneCuponesDisponibles = () => {
    if (oferta.cupones_disponibles === null) return true; // Ilimitado
    return oferta.cupones_disponibles > 0;
  };

  const disponibilidad = () => {
    if (oferta.cupones_disponibles === null) {
      return <Badge bg="success">Disponible</Badge>;
    }
    if (oferta.cupones_disponibles > 10) {
      return <Badge bg="success">{oferta.cupones_disponibles} disponibles</Badge>;
    }
    if (oferta.cupones_disponibles > 0) {
      return <Badge bg="warning" text="dark">¡Solo {oferta.cupones_disponibles} disponibles!</Badge>;
    }
    return <Badge bg="danger">Agotado</Badge>;
  };

  return (
    <Card className="coupon-card h-100">
      <Card.Body className="d-flex flex-column p-4">
        
        {/* 1. Empresa y Categoría */}
        <div className="coupon-top-info d-flex align-items-center gap-3 mb-3">
          <span className="coupon-brand-tag">
            <FaStore className="me-2" />
            {oferta.empresa_nombre}
          </span>
          <span className="coupon-category-tag">{oferta.rubro_nombre}</span>
        </div>
        
        {/* 2. Título de la oferta */}
        <h5 className="fw-bold mb-2" style={{ color: '#003049', minHeight: '3rem' }}>
          {oferta.titulo}
        </h5>

        {/* 3. Precios y Descuento */}
        <div className="mb-3">
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="text-decoration-line-through text-muted" style={{ fontSize: '1rem' }}>
              {formatPrecio(oferta.precio_regular)}
            </span>
            <Badge bg="danger" className="coupon-off">
              {oferta.descuento_pct}% OFF
            </Badge>
          </div>
          <h3 className="coupon-price-value mb-0">
            {formatPrecio(oferta.precio_oferta)}
          </h3>
        </div>

        {/* 4. Descripción */}
        <div className="coupon-description-box mb-3">
          <p className="coupon-text-desc mb-0">
            <FaCheckCircle className="me-2 text-success" />
            {oferta.descripcion}
          </p>
        </div>

        {/* 5. Disponibilidad */}
        <div className="mb-2">
          {disponibilidad()}
        </div>

        {/* 6. Fecha Límite */}
        <div className="expiry-footer mb-3">
          <FaCalendarAlt className="me-2" />
          <span>Válido hasta: {formatFecha(oferta.fecha_limite_uso)}</span>
        </div>

        {/* 7. Boton para comprar ALISSON */}
        <div className="mt-auto pt-3">
          {tieneCuponesDisponibles() ? (
            <Button 
              className="btn-action-full"
              onClick={() => handleComprarCupon(oferta.oferta_id)}
            >
              <FaTag className="me-2" />
              COMPRAR CUPÓN
            </Button>
          ) : (
            <Button className="btn-action-full" disabled>
              AGOTADO
            </Button>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

/**
 * ============================================================
 * FUNCIÓN PARA ALI PELONA
 * ============================================================
 * 
 * @param {number} ofertaId - ID de la oferta a comprar
 * 
 * TODO :
 * 1. Validar que el usuario esté autenticado (verificar sesión/token)
 * 2. Mostrar modal de confirmación con detalles de la compra
 * 3. Procesar el pago (si aplica)
 * 4. Llamar al endpoint POST /api/cupones con:
 *    - oferta_id
 *    - cliente_id (del usuario autenticado)
 *    - precio_pagado
 * 5. Si es exitoso: 
 *    - Mostrar mensaje de éxito
 *    - Redirigir a "Mis Cupones" o mostrar el código generado
 * 6. Si falla: Mostrar mensaje de error
 * 
 * Estructura esperada de la respuesta:
 * {
 *   success: true,
 *   data: { codigo: "RES0011234567", mensaje: "Cupón generado exitosamente" }
 * }
 */
const handleComprarCupon = (ofertaId) => {
  // TODO: Alisson implementará esta función
  console.log('🛒 Comprar cupón de oferta:', ofertaId);
  alert(`Funcionalidad de compra en desarrollo.\nOferta ID: ${ofertaId}\n\n(Alisson implementará esto)`);
};

export default OfertaCard;
