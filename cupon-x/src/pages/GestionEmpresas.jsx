import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Alert } from 'react-bootstrap';
import { getAdminEmpresas, createEmpresa, deleteEmpresa, updateEmpresa, getRubros } from '../services/api';
import '../styles/admindashboard.css';

const initialForm = {
  nombre: '',
  codigo: '',
  rubro_id: '',
  correo: '',
  password: '',
};

const GestionEmpresas = () => {
  const [empresas, setEmpresas] = useState([]);
  const [rubros, setRubros] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const cargarDatos = async () => {
    try {
      const [resEmp, resRub] = await Promise.all([getAdminEmpresas(), getRubros()]);
      if (resEmp.success) setEmpresas(resEmp.data);
      if (resRub.success) setRubros(resRub.data);
    } catch (err) {
      setError('Error al cargar datos');
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await createEmpresa(formData);
      setShowModal(false);
      setFormData(initialForm);
      setSuccess('Empresa creada correctamente.');
      await cargarDatos();
    } catch (err) {
      setError(err.message || 'Error al crear empresa');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActivo = async (empresa) => {
    const accion = empresa.activo ? 'desactivar' : 'reactivar';
    if (!window.confirm(`¿Seguro que deseas ${accion} esta empresa?`)) return;
    setError('');
    try {
      if (empresa.activo) {
        await deleteEmpresa(empresa.id);
        setSuccess('Empresa desactivada correctamente.');
      } else {
        await updateEmpresa(empresa.id, { activo: true });
        setSuccess('Empresa reactivada correctamente.');
      }
      await cargarDatos();
    } catch (err) {
      setError(err.message || `Error al ${accion} empresa`);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="gestion-empresas">

      {/* HEADER */}
      <div className="empresas-header d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2 mb-4">
        <div>
          <h4 className="fw-bold mb-1">Empresas Registradas</h4>
          <small className="text-muted">Gestiona las empresas afiliadas a la plataforma</small>
        </div>
        <Button className="btn-empresa-primary" onClick={() => { setError(''); setFormData(initialForm); setShowModal(true); }}>
          + Nueva Empresa
        </Button>
      </div>

      {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}
      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

      {/* TABLA */}
      <div className="table-container">
        <Table className="custom-table align-middle" responsive>
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Rubro</th>
              <th>Estado</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {empresas.length === 0 ? (
              <tr><td colSpan={5} className="text-muted text-center">No hay empresas registradas.</td></tr>
            ) : (
              empresas.map(emp => (
                <tr key={emp.id}>
                  <td className="fw-semibold">{emp.codigo}</td>
                  <td>{emp.nombre}</td>
                  <td><span className="badge-rubro">{emp.rubro_nombre}</span></td>
                  <td>{emp.activo ? 'Activa' : 'Inactiva'}</td>
                  <td className="text-center">
                    <Button
                      size="sm"
                      variant={emp.activo ? 'outline-danger' : 'outline-success'}
                      onClick={() => handleToggleActivo(emp)}
                    >
                      {emp.activo ? 'Desactivar' : 'Reactivar'}
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      {/* MODAL */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered className="custom-modal">
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title className="fw-bold">Registrar Nueva Empresa</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}

            <Form.Group className="mb-3">
              <Form.Label className="form-label-custom">Nombre de la Empresa</Form.Label>
              <Form.Control
                type="text"
                name="nombre"
                required
                className="input-custom"
                value={formData.nombre}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="form-label-custom">Código de la Empresa</Form.Label>
              <Form.Control
                type="text"
                name="codigo"
                required
                placeholder="Ej: AMA001"
                className="input-custom"
                value={formData.codigo}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="form-label-custom">Rubro / Categoría</Form.Label>
              <Form.Select
                name="rubro_id"
                required
                className="input-custom"
                value={formData.rubro_id}
                onChange={handleChange}
              >
                <option value="">Selecciona un rubro...</option>
                {rubros.map(r => (
                  <option key={r.id} value={r.id}>{r.nombre}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="form-label-custom">Correo Electrónico</Form.Label>
              <Form.Control
                type="email"
                name="correo"
                required
                className="input-custom"
                value={formData.correo}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="form-label-custom">Contraseña</Form.Label>
              <Form.Control
                type="password"
                name="password"
                required
                className="input-custom"
                value={formData.password}
                onChange={handleChange}
              />
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button className="btn-empresa-secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="btn-empresa-primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Empresa'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

    </div>
  );
};

export default GestionEmpresas;
