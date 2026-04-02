import React, { useState } from 'react';
import { Card, Button, Toast } from 'react-bootstrap';
import {
  FaCalendarAlt,
  FaTicketAlt,
  FaCheckCircle,
  FaShoppingCart,
  FaEye
} from 'react-icons/fa';
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

    addToCart({
      id: data.id,
      titulo: data.titulo || data.brand,
      descripcion: data.descripcion || data.description,
      precio_oferta: data.precio_oferta || parseFloat(data.price.replace('$', '')),
      fecha_limite_uso: data.fecha_limite_uso || data.expiry,
      categoria: data.category,
    });

    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const handleViewDetails = () => {
    navigate(`/ofertas/${data.id}`);
  };

  return (
    <>
      <Card className="coupon-card h-100 shadow-sm border-0 overflow-hidden">

        <div className="coupon-image-container mb-3">
          <img
            src={data.imagen_url || "https://placehold.co/300x180?text=Sin+Imagen"}
            alt={data.titulo}
            className="w-100"
            style={{
              height: "180px",
              objectFit: "cover",
              borderRadius: "12px"
            }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/300x180?text=Error";
            }}
          />
        </div>

        <Card.Body className="d-flex flex-column p-4">

          <div className="coupon-top-info d-flex align-items-center gap-2 mb-2">
            <span className="coupon-brand-tag">{data.brand}</span>
            <span className="coupon-category-tag">{data.category}</span>
          </div>

          <h3 className="coupon-price-value">{data.price}</h3>

          <div className="coupon-description-box">
            <p className="coupon-text-desc">
              <FaCheckCircle className="me-2 text-success" />
              {data.description}
            </p>
          </div>

          <div className="coupon-code-container">
            <FaTicketAlt className="me-3" />
            <span>{data.code}</span>
          </div>

          <div className="expiry-footer mt-3">
            <FaCalendarAlt className="me-2" />
            <span>Vence: {data.expiry}</span>
          </div>

          <div className="mt-auto pt-3">
            <div className="d-flex gap-2">

              <Button
                className="flex-grow-1 btn-action-full"
                onClick={handleAddToCart}
              >
                <FaShoppingCart className="me-2" />
                AGREGAR
              </Button>

              <Button
                variant="light"
                className="d-flex align-items-center justify-content-center px-3 border text-secondary"
                style={{ borderRadius: "10px" }}
                onClick={handleViewDetails}
              >
                <FaEye />
              </Button>

            </div>
          </div>

        </Card.Body>
      </Card>

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