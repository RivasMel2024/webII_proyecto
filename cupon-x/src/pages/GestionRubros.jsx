import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Form,
  Modal,
  Alert,
} from "react-bootstrap";
import {
  getRubros,
  createRubroApi,
  updateRubroApi,
  deleteRubroApi,
} from "../services/api";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";

const GestionRubros = () => {
  const [rubros, setRubros] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    id: null,
    nombre: "",
    activo: true,
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const res = await getRubros();
      if (res.success) setRubros(res.data);
    } catch {
      setError("No se pudieron cargar los rubros");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      if (editMode) {
        await updateRubroApi(formData.id, formData);
      } else {
        await createRubroApi({ nombre: formData.nombre });
      }

      setShowModal(false);
      setFormData({ id: null, nombre: "", activo: true });
      cargarDatos();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (r) => {
    setFormData({
      id: r.id,
      nombre: r.nombre,
      activo: r.activo,
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Seguro que deseas desactivar este rubro?")) {
      try {
        await deleteRubroApi(id);
        cargarDatos();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  return (
    <div className="gestion-empresas">
      {/* HEADER */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2 mb-4">
        <div>
          <h4 className="fw-semibold mb-1">Rubros</h4>
          <small>Categorías para organizar empresas y ofertas</small>
        </div>

        <Button
          className="btn-empresa-primary"
          onClick={() => {
            setEditMode(false);
            setFormData({ nombre: "", activo: true });
            setShowModal(true);
          }}
        >
          <FaPlus className="me-2" />
          Nuevo Rubro
        </Button>
      </div>

      {/* ERROR */}
      {error && (
        <Alert
          variant="danger"
          className="py-2"
          onClose={() => setError(null)}
          dismissible
        >
          {error}
        </Alert>
      )}

      {/* TABLA */}
      <div className="table-container">
        <Table responsive className="custom-table align-middle">
          <thead>
            <tr>
              <th style={{ width: "80px" }}>ID</th>
              <th>Nombre</th>
              <th>Estado</th>
              <th className="text-end">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {rubros.map((r) => (
              <tr key={r.id}>
                <td className="text-muted">#{r.id}</td>

                <td className="fw-medium">{r.nombre}</td>

                <td>
                  <span className="badge-rubro">
                    {r.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>

                <td className="text-end">
                  <Button
                    variant="link"
                    className="text-muted p-0 me-3"
                    onClick={() => handleEdit(r)}
                  >
                    <FaEdit />
                  </Button>

                  <Button
                    variant="link"
                    className="text-muted p-0"
                    onClick={() => handleDelete(r.id)}
                  >
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* MODAL */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>
              {editMode ? "Editar Rubro" : "Nuevo Rubro"}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label className="form-label-custom">
                Nombre del rubro
              </Form.Label>

              <Form.Control
                type="text"
                placeholder="Ej: Restaurantes, Tecnología..."
                className="input-custom"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    nombre: e.target.value,
                  })
                }
                required
              />
            </Form.Group>

            {editMode && (
              <Form.Group>
                <Form.Check
                  type="switch"
                  label={formData.activo ? "Activo" : "Inactivo"}
                  checked={formData.activo}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      activo: e.target.checked,
                    })
                  }
                />
                <small className="text-muted">
                  Controla si aparece en filtros públicos
                </small>
              </Form.Group>
            )}
          </Modal.Body>

          <Modal.Footer>
            <Button
              className="btn-empresa-secondary"
              onClick={() => setShowModal(false)}
            >
              Cancelar
            </Button>

            <Button className="btn-empresa-primary" type="submit">
              {editMode ? "Guardar" : "Crear"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default GestionRubros;