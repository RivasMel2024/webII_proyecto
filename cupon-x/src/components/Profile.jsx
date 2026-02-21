import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getAuthUser, changePassword } from '../services/api';
import '../styles/login.css';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const currentUser = getAuthUser();
    console.log('Usuario actual:', currentUser); // Debug
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
  }, [navigate]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);
    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setMessage('Contraseña actualizada exitosamente');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowChangePassword(false);
    } catch (err) {
      setError(err.message || 'Error al cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };


  if (!user) return null;

  return (
    <Container className="login-container" style={{ paddingTop: '2rem' }}>
      <Card className="login-card">
        <Card.Body className="p-4">
          <h2 className="login-title">Mi Perfil</h2>
          
          <div className="mb-4">
            <Row className="mb-3">
              <Col md={6}>
                <strong>Nombre:</strong>
                <p>{user.nombres || 'N/A'}</p>
              </Col>
              <Col md={6}>
                <strong>Apellidos:</strong>
                <p>{user.apellidos || 'N/A'}</p>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <strong>Correo:</strong>
                <p>{user.email || user.correo || 'N/A'}</p>
              </Col>
              <Col md={6}>
                <strong>Teléfono:</strong>
                <p>{user.telefono || 'N/A'}</p>
              </Col>
            </Row>

            {user.dui && (
              <Row className="mb-3">
                <Col md={6}>
                  <strong>DUI:</strong>
                  <p>{user.dui}</p>
                </Col>
                <Col md={6}>
                  <strong>Rol:</strong>
                  <p>{user.role || 'CLIENTE'}</p>
                </Col>
              </Row>
            )}

            {user.direccion && (
              <Row className="mb-3">
                <Col md={12}>
                  <strong>Dirección:</strong>
                  <p>{user.direccion}</p>
                </Col>
              </Row>
            )}
          </div>

          {!showChangePassword ? (
            <Button 
              variant="outline-primary" 
              className="w-100 mb-3"
              onClick={() => setShowChangePassword(true)}
            >
              Cambiar Contraseña
            </Button>
          ) : (
            <div className="mt-4">
              <h5>Cambiar Contraseña</h5>
              <Form onSubmit={handlePasswordChange}>
                <Form.Group className="mb-3">
                  <Form.Label className="login-label">Contraseña Actual</Form.Label>
                  <Form.Control
                    type="password"
                    className="login-input"
                    required
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                    }
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="login-label">Nueva Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    className="login-input"
                    required
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                    }
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="login-label">Confirmar Nueva Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    className="login-input"
                    required
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                    }
                  />
                </Form.Group>

                {error && (
                  <div className="text-danger mb-3" style={{ fontSize: '0.9rem' }}>
                    {error}
                  </div>
                )}
                {message && (
                  <div className="text-success mb-3" style={{ fontSize: '0.9rem' }}>
                    {message}
                  </div>
                )}

                <div className="d-flex gap-2">
                  <Button type="submit" className="btn-login-submit flex-grow-1" disabled={loading}>
                    {loading ? 'Actualizando...' : 'Actualizar'}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowChangePassword(false);
                      setError('');
                      setMessage('');
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </Form>
            </div>
          )}

         
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Profile;
