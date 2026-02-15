import React from 'react';
import { Container, Form, Button, Card, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import '../styles/login.css'; // Reutilizamos el estilo de Login para consistencia

const Registration = () => {
  return (
    <Container className="login-container">
      <Card className="login-card" style={{ maxWidth: '500px' }}>
        <Card.Body>
          <h2 className="login-title">Crear Cuenta</h2>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="login-label">Nombre</Form.Label>
                  <Form.Control type="text" placeholder="Juan" className="login-input" required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="login-label">Apellido</Form.Label>
                  <Form.Control type="text" placeholder="Pérez" className="login-input" required />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="login-label">DUI</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="00000000-0" 
                className="login-input" 
                pattern="[0-9]{8}-[0-9]{1}"
                required 
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="login-label">Correo Electrónico</Form.Label>
              <Form.Control type="email" placeholder="ejemplo@correo.com" className="login-input" required />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="login-label">Contraseña</Form.Label>
              <Form.Control type="password" placeholder="Mínimo 8 caracteres" className="login-input" required />
            </Form.Group>

            <Button className="btn-login-submit" type="submit">
              REGISTRARME
            </Button>
          </Form>
          
          <div className="login-footer-text">
            <span>¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></span>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Registration;