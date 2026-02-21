import React, { useState } from 'react';
import { Card, Button, Toast } from 'react-bootstrap';
import { FaCalendarAlt, FaTicketAlt, FaCheckCircle, FaShoppingCart } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../services/api';

const CouponCard = ({ data }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [showToast, setShowToast] = useState(false);

  const handleAddToCart = () => {
    if (!isAuthenticated()) {
      alert('Debes iniciar sesión para comprar cupones');
      navigate('/login');
      return;
    }

    // Agregar al carrito con toda la información de la oferta
    addToCart({
      id: data.id,
      titulo: data.titulo || data.brand,
      descripcion: data.descripcion || data.description,
      precio_oferta: data.precio_oferta || parseFloat(data.price.replace('$', '')),
      fecha_limite_uso: data.fecha_limite_uso || data.expiry,
      categoria: data.category,
    });

    // Mostrar toast de confirmación
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };
  return (
    <>
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
             <Button 
               className="btn-action-full"
               onClick={handleAddToCart}
             >
                <FaShoppingCart className="me-2" />
                AGREGAR AL CARRITO
             </Button>
          </div>
        </Card.Body>
      </Card>

      {/* Toast de confirmación */}
      <Toast 
        show={showToast} 
        onClose={() => setShowToast(false)}
        style={{
          position: 'fixed',
          top: 80,
          right: 20,
          zIndex: 9999,
          minWidth: '250px'
        }}
        delay={2000}
        autohide
      >
        <Toast.Header closeButton={false} className="bg-success text-white">
          <FaCheckCircle className="me-2" />
          <strong className="me-auto">¡Agregado!</strong>
        </Toast.Header>
        <Toast.Body>
          {data.brand} se agregó al carrito
        </Toast.Body>
      </Toast>
    </>
  );
};

export default CouponCard;