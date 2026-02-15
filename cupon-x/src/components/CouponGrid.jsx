import React, { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import CouponCard from './CouponCard';
import '../styles/coupongrid.css';

const CouponGrid = () => {
  // Datos simulados (luego vendrán de tu Base de Datos)
  const [coupons] = useState([
    { 
      id: 1, 
      brand: 'MICROSOFT', 
      category: 'TECH', 
      price: '$20.00 OFF', 
      description: 'Válido en licencias de Office 365 y laptops Surface.',
      expiry: '31/12/2026',
      code: 'MSFT2026'
    },
    { 
      id: 2, 
      brand: 'AMAZON', 
      category: 'TECH', 
      price: '15% OFF', 
      description: 'Aplica para dispositivos Echo y accesorios de tecnología.',
      expiry: '30/11/2026',
      code: 'AMZTECH'
    },
    { 
      id: 3, 
      brand: 'APPLE', 
      category: 'DEVICES', 
      price: '$50.00 OFF', 
      description: 'Descuento en iPad Air y accesorios originales.',
      expiry: '15/05/2026',
      code: 'APPLE50'
    }
  ]);

  return (
    <section className="coupon-grid-section">
      <Container>
        {/* Cabecera con Título y Botón alineado a la derecha */}
        <div className="d-flex justify-content-between align-items-end mb-5">
          <div className="section-header-box">
            <h2 className="section-title">Top <span className="highlight">Coupons</span></h2>
            <div className="section-line"></div>
          </div>
          
          <a href="#all" className="see-all-link">
            See All Coupons <span className="ms-1"></span>
          </a>
        </div>

        <Row className="g-4">
          {coupons.map((item) => (
            <Col key={item.id} lg={4} md={6}>
              <CouponCard data={item} />
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default CouponGrid;