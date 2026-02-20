import React, { useState } from 'react';
import { Container, Form, Button, Card, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/login.css'; 
import { registerCliente } from '../services/api';

const Registration = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombres: '',
    apellidos: '',
    telefono: '',
    dui: '',
    direccion: '',
    correo: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const onChange = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const result = await registerCliente(form);
      setMessage(result.message || 'Registrado. Verifica tu cuenta.');
      // Llevar al login
      setTimeout(() => navigate('/login'), 800);
    } catch (err) {
      setError(err.message || 'Error al registrar');
    } finally {
      setLoading(false);
    }
  };

  // Lista de países (puedes agregar más)
  const paises = ["El Salvador", "Guatemala", "Honduras", "Nicaragua", "Costa Rica", "Panamá"];

  return (
    <Container className="login-container">
      <Card className="login-card">
        <Card.Body>
          <h2 className="login-title">Crear Cuenta</h2>
          <Form onSubmit={onSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="login-label">Nombre</Form.Label>
                  <Form.Control type="text" placeholder="Juan" className="login-input" required value={form.nombres} onChange={onChange('nombres')} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="login-label">Apellido</Form.Label>
                  <Form.Control type="text" placeholder="Pérez" className="login-input" required value={form.apellidos} onChange={onChange('apellidos')} />
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
                    value={form.dui}
                    onChange={onChange('dui')}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="login-label">Teléfono</Form.Label>
              <Form.Control
                type="text"
                placeholder="0000-0000"
                className="login-input"
                required
                value={form.telefono}
                onChange={onChange('telefono')}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="login-label">Dirección</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={2}
                placeholder="Departamento, municipio, calle..." 
                className="login-input" 
                required 
                value={form.direccion}
                onChange={onChange('direccion')}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="login-label">Correo Electrónico</Form.Label>
              <Form.Control type="email" placeholder="ejemplo@correo.com" className="login-input" required value={form.correo} onChange={onChange('correo')} />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="login-label">Contraseña</Form.Label>
              <Form.Control type="password" placeholder="Mínimo 8 caracteres" className="login-input" required value={form.password} onChange={onChange('password')} />
            </Form.Group>

            {error ? (
              <div className="text-danger mb-3" style={{ fontSize: '0.9rem' }}>
                {error}
              </div>
            ) : null}
            {message ? (
              <div className="text-success mb-3" style={{ fontSize: '0.9rem', whiteSpace: 'pre-line' }}>
                {message}
              </div>
            ) : null}

            <Button className="btn-login-submit" type="submit" disabled={loading}>
              {loading ? 'REGISTRANDO...' : 'REGISTRARME'}
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