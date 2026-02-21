import React from 'react';
import { Container, Row, Col, Card, Badge, Button } from 'react-bootstrap';
import { FaHistory, FaTicketAlt, FaCalendarCheck, FaQrcode, FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import "../styles/variables.css";

const HistorialPage = () => {
  // Datos de prueba: Cupones ya comprados
  const purchasedCoupons = [
    { 
      id: 1, 
      brand: "Pizza Hut", 
      description: "2x1 en Pizzas Grandes", 
      date: "15 Feb 2026", 
      status: "Disponible",
      code: "PH-99281" 
    },
    { 
      id: 2, 
      brand: "Adidas", 
      description: "20% descuento en calzado", 
      date: "10 Feb 2026", 
      status: "Canjeado",
      code: "AD-11022" 
    }
  ];

  return (
    <Container className="py-5">
      <div className="d-flex align-items-center mb-4">
        <Link to="/" className="text-decoration-none me-3" style={{color: 'var(--color-text)'}}>
          <FaArrowLeft size={20} />
        </Link>
        <h2 className="fw-bold mb-0">Mi Historial <FaHistory className="ms-2" /></h2>
      </div>

      <Row>
        {purchasedCoupons.map((coupon) => (
          <Col md={6} lg={4} key={coupon.id} className="mb-4">
            <Card className={`history-ticket ${coupon.status === 'Canjeado' ? 'ticket-used' : ''}`}>
              <Card.Body className="p-0 d-flex flex-column">
                
                {/* Parte superior del ticket */}
                <div className="ticket-top p-3 text-center">
                  <Badge bg={coupon.status === 'Disponible' ? 'success' : 'secondary'} className="mb-2">
                    {coupon.status.toUpperCase()}
                  </Badge>
                  <h5 className="fw-bold mb-1">{coupon.brand}</h5>
                  <p className="small mb-0 text-muted">{coupon.description}</p>
                </div>

                {/* Línea divisoria decorativa (Corte de ticket) */}
                <div className="ticket-divider">
                  <div className="notch left"></div>
                  <div className="dots"></div>
                  <div className="notch right"></div>
                </div>

                {/* Parte inferior del ticket */}
                <div className="ticket-bottom p-3">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="small text-muted">
                      <FaCalendarCheck className="me-1" /> {coupon.date}
                    </div>
                    <div className="fw-bold text-primary-dark">
                      {coupon.code}
                    </div>
                  </div>
                  
                  {coupon.status === 'Disponible' ? (
                    <Button variant="outline-dark" className="w-100 d-flex align-items-center justify-content-center">
                      <FaQrcode className="me-2" /> VER QR
                    </Button>
                  ) : (
                    <Button variant="light" disabled className="w-100">
                      CUPÓN UTILIZADO
                    </Button>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default HistorialPage;