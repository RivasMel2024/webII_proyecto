import React from 'react';
import { Container, Form, Button, Card, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import '../styles/login.css'; 

const Registration = () => {
  // Lista de países (puedes agregar más)
  const paises = ["El Salvador", "Guatemala", "Honduras", "Nicaragua", "Costa Rica", "Panamá"];

  return (
    <Container className="login-container">
      <Card className="login-card">
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

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="login-label">País</Form.Label>
                  <Form.Select className="login-input" required>
                    <option value="">Seleccionar...</option>
                    {paises.map(pais => (
                      <option key={pais} value={pais}>{pais}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="login-label">DUI / ID</Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="00000000-0" 
                    className="login-input" 
                    required 
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="login-label">Dirección</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={2}
                placeholder="Departamento, municipio, calle..." 
                className="login-input" 
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