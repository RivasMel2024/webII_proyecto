import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import { getAdminEmpresas, createEmpresa, getRubros } from '../services/api';
import '../styles/admindashboard.css';

const GestionEmpresas = () => {
  const [empresas, setEmpresas] = useState([]);
  const [rubros, setRubros] = useState([]);
  const [showModal, setShowModal] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre: '',
    codigo: '',
    rubro_id: '', 
    correo: '',
    password: '',
    porcentaje_comision: 10
  });

  useEffect(() => {
    const cargarDatosIniciales = async () => {
      const resEmp = await getAdminEmpresas();
      if (resEmp.success) setEmpresas(resEmp.data);

      const resRub = await getRubros(); 
      if (resRub.success) setRubros(resRub.data);
    };

    cargarDatosIniciales();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await createEmpresa(formData);
    if (res.success) {
      setShowModal(false);
      const updated = await getAdminEmpresas();
      setEmpresas(updated.data);
    }
  };

  return (
    <div className="gestion-empresas">

      {/* HEADER */}
      <div className="empresas-header d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2 mb-4">
        <div>
          <h4 className="fw-bold mb-1">Empresas Registradas</h4>
          <small className="text-muted">Gestiona las empresas afiliadas a la plataforma</small>
        </div>

        <Button 
          className="btn-empresa-primary"
          onClick={() => setShowModal(true)}
        >
          + Nueva Empresa
        </Button>
      </div>

      {/* TABLA */}
      <div className="table-container">
        <Table className="custom-table align-middle" responsive>
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Rubro</th>
              <th>Comisión</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {empresas.map(emp => (
              <tr key={emp.id}>
                <td className="fw-semibold">{emp.codigo}</td>
                <td>{emp.nombre}</td>
                <td>
                  <span className="badge-rubro">{emp.rubro_nombre}</span>
                </td>
                <td>
                  <span className="badge-comision">
                    {emp.porcentaje_comision}%
                  </span>
                </td>
                <td className="text-center">
                  <Button 
                    size="sm" 
                    className="btn-empresa-danger"
                  >
                    Desactivar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* MODAL */}
      <Modal 
        show={showModal} 
        onHide={() => setShowModal(false)}
        centered
        className="custom-modal"
      >
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title className="fw-bold">
              Registrar Nueva Empresa
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label className="form-label-custom">
                Nombre de la Empresa
              </Form.Label>
              <Form.Control 
                type="text" 
                required 
                className="input-custom"
                onChange={e => setFormData({...formData, nombre: e.target.value})} 
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="form-label-custom">
                Rubro / Categoría
              </Form.Label>
              <Form.Select 
                required 
                className="input-custom"
                onChange={e => setFormData({...formData, rubro_id: e.target.value})}
              >
                <option value="">Selecciona un rubro...</option>
                {rubros.map(r => (
                  <option key={r.id} value={r.id}>{r.nombre}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="form-label-custom">
                Correo Electrónico
              </Form.Label>
              <Form.Control 
                type="email" 
                required 
                className="input-custom"
                onChange={e => setFormData({...formData, correo: e.target.value})} 
              />
            </Form.Group>

          </Modal.Body>

          <Modal.Footer>
            <Button 
              className="btn-empresa-secondary"
              onClick={() => setShowModal(false)}
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              className="btn-empresa-primary"
            >
              Guardar Empresa
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

    </div>
  );
};

export default GestionEmpresas;