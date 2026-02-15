import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { FaChevronDown } from 'react-icons/fa';
import '../styles/hero.css';

const Hero = () => {
  return (
    <section className="hero-section">
      <Container>
        <Row className="align-items-center">
          <Col lg={7} className="hero-content">
            <h1 className="hero-title">
              Descubre los mejores <br />
              <span className="highlight">Cupones</span>
            </h1>
            <p className="hero-description">
              Ofertas para que puedas comprar las cosas que quieras de forma económica.
            </p>

            <div className="search-container">
              <div className="search-box">
                <div className="category-select">
                  Categoría <FaChevronDown className="ms-1 icon-sm" />
                </div>
                <div className="divider"></div>
                <input 
                  type="text" 
                  placeholder="Nombre del cupón o tienda..." 
                  className="search-input"
                />
                <Button className="btn-hero-search">
                  Buscar
                </Button>
              </div>
            </div>

            <div className="hero-tags">
              {['Restaurante', 'Turismo', 'Entretenimiento', 'Educación', 'Otros'].map((tag, i) => (
                <span key={i} className="tag-pill">{tag}</span>
              ))}
            </div>
          </Col>
          
          <Col lg={5} className="d-none d-lg-block">
            <div className="hero-image-wrapper">
              <img 
                src="/images/shopping.jpg" 
                alt="Hero Cupones" 
                className="hero-main-img" 
              />
              <div className="image-blob-bg"></div>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Hero;