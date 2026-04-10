import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Form, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getAuthUser, changePassword, getMiEmpresa, updateMiEmpresa } from '../services/api';
import '../styles/profile.css';

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

  // Empresa state
  const [empresa, setEmpresa] = useState(null);
  const [editingEmpresa, setEditingEmpresa] = useState(false);
  const [empresaForm, setEmpresaForm] = useState({
    direccion: '',
    telefono: '',
    nombre_contacto: '',
    descripcion: '',
  });
  const [empresaMsg, setEmpresaMsg] = useState('');
  const [empresaErr, setEmpresaErr] = useState('');
  const [empresaLoading, setEmpresaLoading] = useState(false);

  useEffect(() => {
    const currentUser = getAuthUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);

    if (currentUser.role === 'ADMIN_EMPRESA') {
      getMiEmpresa().then((res) => {
        if (res.success) {
          setEmpresa(res.data);
          setEmpresaForm({
            direccion: res.data.direccion || '',
            telefono: res.data.telefono || '',
            nombre_contacto: res.data.nombre_contacto || '',
            descripcion: res.data.descripcion || '',
          });
        }
      });
    }
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

  const handleEmpresaSubmit = async (e) => {
    e.preventDefault();
    setEmpresaErr('');
    setEmpresaMsg('');
    setEmpresaLoading(true);
    try {
      const res = await updateMiEmpresa(empresaForm);
      if (res.success) {
        setEmpresa((prev) => ({ ...prev, ...res.data }));
        setEmpresaMsg('Información actualizada correctamente');
        setEditingEmpresa(false);
      }
    } catch (err) {
      setEmpresaErr(err.message || 'Error al actualizar');
    } finally {
      setEmpresaLoading(false);
    }
  };

  if (!user) return null;

  const isEmpresa = user.role === 'ADMIN_EMPRESA';

  return (
    <Container className="profile-container">
      <Card className="profile-card">
        <Card.Body>

          {/* Header */}
          <div className="profile-header text-center">
            <div className="profile-avatar">
              {isEmpresa ? (empresa?.nombre?.[0] || 'E') : (user.nombres?.[0] || 'U')}
            </div>
            <h3 className="profile-name">
              {isEmpresa ? empresa?.nombre : `${user.nombres} ${user.apellidos}`}
            </h3>
            <p className="profile-email">{user.email || user.correo}</p>
            {isEmpresa && empresa && (
              <Badge bg="secondary" className="mt-1">{empresa.rubro_nombre}</Badge>
            )}
          </div>

          {/* Info básica */}
          <div className="profile-info">
            {isEmpresa ? (
              <>
                <Row className="mb-2">
                  <Col md={6}>
                    <div className="profile-item">
                      <span>Código</span>
                      <p>{empresa?.codigo || '—'}</p>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="profile-item">
                      <span>Teléfono</span>
                      <p>{empresa?.telefono || '—'}</p>
                    </div>
                  </Col>
                </Row>
                <Row className="mb-2">
                  <Col md={6}>
                    <div className="profile-item">
                      <span>Nombre de contacto</span>
                      <p>{empresa?.nombre_contacto || '—'}</p>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="profile-item">
                      <span>Dirección</span>
                      <p>{empresa?.direccion || '—'}</p>
                    </div>
                  </Col>
                </Row>
                {empresa?.descripcion && (
                  <div className="profile-item">
                    <span>Descripción</span>
                    <p>{empresa.descripcion}</p>
                  </div>
                )}
              </>
            ) : (
              <Row>
                <Col md={6}>
                  <div className="profile-item">
                    <span>Teléfono</span>
                    <p>{user.telefono || 'N/A'}</p>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="profile-item">
                    <span>Rol</span>
                    <p>{user.role || 'CLIENTE'}</p>
                  </div>
                </Col>
              </Row>
            )}

            {!isEmpresa && user.dui && (
              <div className="profile-item">
                <span>DUI</span>
                <p>{user.dui}</p>
              </div>
            )}

            {!isEmpresa && user.direccion && (
              <div className="profile-item">
                <span>Dirección</span>
                <p>{user.direccion}</p>
              </div>
            )}
          </div>

          {/* Formulario editar empresa */}
          {isEmpresa && (
            <div className="mt-3">
              {empresaMsg && <div className="text-success mb-2">{empresaMsg}</div>}
              {empresaErr && <div className="text-danger mb-2">{empresaErr}</div>}

              {!editingEmpresa ? (
                <Button
                  className="btn-profile-primary w-100 mb-2"
                  onClick={() => { setEditingEmpresa(true); setEmpresaMsg(''); setEmpresaErr(''); }}
                >
                  Editar información de la empresa
                </Button>
              ) : (
                <Form onSubmit={handleEmpresaSubmit} className="mb-3">
                  <h5 className="mb-3">Editar información</h5>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Nombre de contacto</Form.Label>
                        <Form.Control
                          type="text"
                          value={empresaForm.nombre_contacto}
                          onChange={(e) => setEmpresaForm((p) => ({ ...p, nombre_contacto: e.target.value }))}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Teléfono</Form.Label>
                        <Form.Control
                          type="text"
                          value={empresaForm.telefono}
                          onChange={(e) => setEmpresaForm((p) => ({ ...p, telefono: e.target.value }))}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Form.Group className="mb-3">
                    <Form.Label>Dirección</Form.Label>
                    <Form.Control
                      type="text"
                      value={empresaForm.direccion}
                      onChange={(e) => setEmpresaForm((p) => ({ ...p, direccion: e.target.value }))}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Descripción</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={empresaForm.descripcion}
                      onChange={(e) => setEmpresaForm((p) => ({ ...p, descripcion: e.target.value }))}
                    />
                  </Form.Group>
                  <div className="d-flex gap-2">
                    <Button type="submit" className="btn-profile-primary flex-grow-1" disabled={empresaLoading}>
                      {empresaLoading ? 'Guardando...' : 'Guardar cambios'}
                    </Button>
                    <Button
                      className="btn-profile-secondary"
                      onClick={() => { setEditingEmpresa(false); setEmpresaErr(''); setEmpresaMsg(''); }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </Form>
              )}
            </div>
          )}

          {/* Cambiar contraseña */}
          {!showChangePassword ? (
            <Button
              className="btn-profile-primary w-100"
              onClick={() => setShowChangePassword(true)}
            >
              Cambiar Contraseña
            </Button>
          ) : (
            <div className="profile-password mt-4">
              <h5 className="mb-3">Cambiar Contraseña</h5>
              <Form onSubmit={handlePasswordChange}>
                <Form.Group className="mb-3">
                  <Form.Label>Contraseña Actual</Form.Label>
                  <Form.Control
                    type="password"
                    required
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Nueva Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    required
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Confirmar Nueva Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    required
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  />
                </Form.Group>

                {error && <div className="text-danger mb-2">{error}</div>}
                {message && <div className="text-success mb-2">{message}</div>}

                <div className="d-flex gap-2">
                  <Button type="submit" className="btn-profile-primary flex-grow-1" disabled={loading}>
                    {loading ? 'Actualizando...' : 'Actualizar'}
                  </Button>
                  <Button
                    className="btn-profile-secondary"
                    onClick={() => { setShowChangePassword(false); setError(''); setMessage(''); }}
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
