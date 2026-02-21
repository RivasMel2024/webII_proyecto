import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { FaCalendarAlt, FaTicketAlt, FaCheckCircle } from 'react-icons/fa';

const CouponCard = ({ data }) => {
  return (
    <Card className="coupon-card h-100">
      <Card.Body className="d-flex flex-column p-4">
        {/* 1. Marca y Categoría (Con gap para evitar que se peguen) */}
        <div className="coupon-top-info d-flex align-items-center gap-3 mb-3">
          <span className="coupon-brand-tag">{data.brand}</span>
          <span className="coupon-category-tag">{data.category}</span>
        </div>
        
        {/* 2. Precio */}
        <h3 className="coupon-price-value">{data.price}</h3>

        {/* 3. Descripción */}
        <div className="coupon-description-box">
          <p className="coupon-text-desc">
            <FaCheckCircle className="me-2 text-success" />
            {data.description}
          </p>
        </div>

        {/* 4. Código (Con margen al icono me-3) */}
        <div className="coupon-code-container">
          <FaTicketAlt className="code-icon-style me-3" /> 
          <span className="code-font">{data.code}</span>
        </div>

        {/* 5. Vencimiento */}
        <div className="expiry-footer mt-3">
          <FaCalendarAlt className="me-2" />
          <span>Vence: {data.expiry}</span>
        </div>
        
        {/* Botón de Acción a pantalla completa */}
        <div className="mt-auto pt-3">
           <Button className="btn-action-full"
           onClick={() => alert(`Añadido al carrito: ${data.brand}`)}
           >
              COMPRAR CUPÓN
           </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default CouponCard;