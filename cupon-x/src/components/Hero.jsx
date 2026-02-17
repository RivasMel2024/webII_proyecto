import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
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

            {/* Hemos eliminado el search-container de aquí */}

            <div className="hero-tags">
              {['Restaurantes', 'Turismo', 'Entretenimiento', 'Educación', 'Salud', 'Salones de belleza', 'Gimnasio', 'Otros'].map((tag, i) => (
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