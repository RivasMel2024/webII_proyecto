import React, { useCallback, useEffect, useState } from 'react';
import {
  createEmpleado,
  deleteEmpleado,
  getAuthUser,
  getEmpleadoById,
  getEmpleados,
  updateEmpleado,
} from '../services/api';
import '../styles/empresa-panel.css';
import '../styles/variables.css';

const initialCreateForm = {
  nombres: '',
  apellidos: '',
  correo: '',
  password: '',
};

const initialEditForm = {
  id: null,
  nombres: '',
  apellidos: '',
  correo: '',
  activo: true,
};

const isEmailValid = (email) => /\S+@\S+\.\S+/.test(email);

const toUserErrorMessage = (message) => {
  const msg = String(message || '');
  const lower = msg.toLowerCase();

  if (lower.includes('401') || lower.includes('no autenticado')) {
    return 'Tu sesión expiró o no es válida. Inicia sesión nuevamente.';
  }
  if (lower.includes('403') || lower.includes('no autorizado')) {
    return 'No autorizado para esta acción.';
  }
  if (lower.includes('409') || lower.includes('transición inválida') || lower.includes('transicion invalida')) {
    return 'Transición inválida para el estado actual.';
  }

  return msg || 'Ocurrió un error inesperado.';
};

function EmpleadoModal({ title, children, onClose }) {
  return (
    <div className="modal d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0, 0, 0, 0.45)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="h5 mb-0">{title}</h2>
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
          </div>
          <div className="modal-body">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function EmpresaEmpleadosPage() {
  const canManage = getAuthUser()?.role === 'ADMIN_EMPRESA';
  const [empleadosState, setEmpleadosState] = useState([]);
  const [loadingEmpleados, setLoadingEmpleados] = useState(true);
  const [errorEmpleados, setErrorEmpleados] = useState('');
  const [actionLoadingById, setActionLoadingById] = useState({});

  const [modalCreateOpen, setModalCreateOpen] = useState(false);
  const [modalEditOpen, setModalEditOpen] = useState(false);

  const [createForm, setCreateForm] = useState(initialCreateForm);
  const [editForm, setEditForm] = useState(initialEditForm);

  const [formErrors, setFormErrors] = useState({
    create: {},
    edit: {},
  });

  const [submitSuccess, setSubmitSuccess] = useState('');
  const [submitError, setSubmitError] = useState('');

  const loadEmpleados = useCallback(async () => {
    setLoadingEmpleados(true);
    setErrorEmpleados('');
    try {
      const response = await getEmpleados();
      setEmpleadosState(Array.isArray(response?.data) ? response.data : []);
    } catch (err) {
      setErrorEmpleados(toUserErrorMessage(err.message || 'Error al obtener empleados'));
      setEmpleadosState([]);
    } finally {
      setLoadingEmpleados(false);
    }
  }, []);

  useEffect(() => {
    loadEmpleados();
  }, [loadEmpleados]);

  const validateCreate = (form) => {
    const errors = {};

    if (!form.nombres.trim()) errors.nombres = 'Nombres es obligatorio.';
    if (!form.apellidos.trim()) errors.apellidos = 'Apellidos es obligatorio.';
    if (!form.correo.trim()) errors.correo = 'Correo es obligatorio.';
    if (form.correo && !isEmailValid(form.correo)) errors.correo = 'Correo no válido.';
    if (!form.password) errors.password = 'Password es obligatorio.';
    if (form.password && form.password.length < 8) errors.password = 'Password debe tener al menos 8 caracteres.';

    return errors;
  };

  const validateEdit = (form) => {
    const errors = {};

    if (!form.nombres.trim()) errors.nombres = 'Nombres es obligatorio.';
    if (!form.apellidos.trim()) errors.apellidos = 'Apellidos es obligatorio.';
    if (!form.correo.trim()) errors.correo = 'Correo es obligatorio.';
    if (form.correo && !isEmailValid(form.correo)) errors.correo = 'Correo no válido.';

    return errors;
  };

  const openCreateModal = () => {
    if (!canManage) {
      setSubmitError('No autorizado para esta acción.');
      return;
    }
    setFormErrors((prev) => ({ ...prev, create: {} }));
    setCreateForm(initialCreateForm);
    setSubmitError('');
    setSubmitSuccess('');
    setModalCreateOpen(true);
  };

  const openEditModal = async (empleado) => {
    if (!canManage) {
      setSubmitError('No autorizado para esta acción.');
      return;
    }
    const empleadoId = empleado.id;
    setActionLoadingById((prev) => ({ ...prev, [empleadoId]: true }));
    setSubmitError('');
    setSubmitSuccess('');

    try {
      const response = await getEmpleadoById(empleadoId);
      const source = response?.data || empleado;

      setEditForm({
        id: source.id,
        nombres: source.nombres || '',
        apellidos: source.apellidos || '',
        correo: source.correo || '',
        activo: Boolean(source.activo),
      });
      setFormErrors((prev) => ({ ...prev, edit: {} }));
      setModalEditOpen(true);
    } catch (err) {
      setSubmitError(toUserErrorMessage(err.message || 'Error al obtener empleado'));
    } finally {
      setActionLoadingById((prev) => ({ ...prev, [empleadoId]: false }));
    }
  };

  const handleCreateSubmit = async (event) => {
    event.preventDefault();
    if (!canManage || actionLoadingById.create) return;

    const errors = validateCreate(createForm);
    setFormErrors((prev) => ({ ...prev, create: errors }));
    if (Object.keys(errors).length > 0) return;

    setActionLoadingById((prev) => ({ ...prev, create: true }));
    setSubmitError('');
    setSubmitSuccess('');

    try {
      await createEmpleado({
        nombres: createForm.nombres.trim(),
        apellidos: createForm.apellidos.trim(),
        correo: createForm.correo.trim().toLowerCase(),
        password: createForm.password,
      });

      setModalCreateOpen(false);
      setCreateForm(initialCreateForm);
      await loadEmpleados();
      setSubmitSuccess('Empleado creado correctamente.');
    } catch (err) {
      setSubmitError(toUserErrorMessage(err.message || 'Error al crear empleado'));
    } finally {
      setActionLoadingById((prev) => ({ ...prev, create: false }));
    }
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    if (!canManage || actionLoadingById[`edit-${editForm.id}`]) return;

    const errors = validateEdit(editForm);
    setFormErrors((prev) => ({ ...prev, edit: errors }));
    if (Object.keys(errors).length > 0 || !editForm.id) return;

    setActionLoadingById((prev) => ({ ...prev, [`edit-${editForm.id}`]: true }));
    setSubmitError('');
    setSubmitSuccess('');

    try {
      await updateEmpleado(editForm.id, {
        nombres: editForm.nombres.trim(),
        apellidos: editForm.apellidos.trim(),
        correo: editForm.correo.trim().toLowerCase(),
        activo: Boolean(editForm.activo),
      });

      setModalEditOpen(false);
      setEditForm(initialEditForm);
      await loadEmpleados();
      setSubmitSuccess('Empleado actualizado correctamente.');
    } catch (err) {
      setSubmitError(toUserErrorMessage(err.message || 'Error al actualizar empleado'));
    } finally {
      setActionLoadingById((prev) => ({ ...prev, [`edit-${editForm.id}`]: false }));
    }
  };

  const handleToggleActivo = async (empleado) => {
    const empleadoId = empleado.id;
    const estaActivo = Boolean(empleado.activo);
    if (!canManage || actionLoadingById[`delete-${empleadoId}`]) return;

    const mensaje = estaActivo
      ? '¿Seguro que deseas desactivar este empleado?'
      : '¿Seguro que deseas reactivar este empleado?';
    if (!window.confirm(mensaje)) return;

    setActionLoadingById((prev) => ({ ...prev, [`delete-${empleadoId}`]: true }));
    setSubmitError('');
    setSubmitSuccess('');

    try {
      if (estaActivo) {
        await deleteEmpleado(empleadoId);
        setSubmitSuccess('Empleado desactivado correctamente.');
      } else {
        await updateEmpleado(empleadoId, {
          nombres: empleado.nombres,
          apellidos: empleado.apellidos,
          correo: empleado.correo,
          activo: true,
        });
        setSubmitSuccess('Empleado reactivado correctamente.');
      }
      await loadEmpleados();
    } catch (err) {
      setSubmitError(toUserErrorMessage(err.message || 'Error al actualizar empleado'));
    } finally {
      setActionLoadingById((prev) => ({ ...prev, [`delete-${empleadoId}`]: false }));
    }
  };

  return (
    <section className="container py-4 empresa-panel-page">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3 empresa-panel-header">
        <h1 className="h3 mb-0 empresa-panel-title">Gestión de empleados</h1>
        {canManage && (
          <button type="button" className="btn btn-signin" onClick={openCreateModal}>
            Nuevo empleado
          </button>
        )}
      </div>

      {submitSuccess && <div className="alert alert-success py-2">{submitSuccess}</div>}
      {submitError && <div className="alert alert-danger py-2">{submitError}</div>}

      <section className="p-3 empresa-soft-card bg-white">
        <h2 className="h5 mb-3">Listado de empleados</h2>

        {loadingEmpleados && <p className="mb-1">Cargando empleados...</p>}
        {errorEmpleados && <p className="text-danger mb-1">{errorEmpleados}</p>}

        {!loadingEmpleados && !errorEmpleados && (
          <div className="table-responsive">
            <table className="table table-sm align-middle mb-0">
              <thead>
                <tr>
                  <th>Nombres</th>
                  <th>Apellidos</th>
                  <th>Correo</th>
                  <th>Activo</th>
                  <th>Creado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {empleadosState.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-muted">No hay empleados registrados.</td>
                  </tr>
                ) : (
                  empleadosState.map((empleado) => (
                    <tr key={empleado.id}>
                      <td>{empleado.nombres}</td>
                      <td>{empleado.apellidos}</td>
                      <td>{empleado.correo}</td>
                      <td>{empleado.activo ? 'Sí' : 'No'}</td>
                      <td>{empleado.created_at ? new Date(empleado.created_at).toLocaleDateString() : '-'}</td>
                      <td>
                        {canManage ? (
                          <div className="d-flex gap-2">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => openEditModal(empleado)}
                              disabled={Boolean(actionLoadingById[empleado.id])}
                            >
                              {actionLoadingById[empleado.id] ? 'Cargando...' : 'Editar'}
                            </button>
                            <button
                              type="button"
                              className={`btn btn-sm ${empleado.activo ? 'btn-outline-danger' : 'btn-outline-success'}`}
                              onClick={() => handleToggleActivo(empleado)}
                              disabled={Boolean(actionLoadingById[`delete-${empleado.id}`])}
                            >
                              {actionLoadingById[`delete-${empleado.id}`]
                                ? (empleado.activo ? 'Desactivando...' : 'Reactivando...')
                                : (empleado.activo ? 'Desactivar' : 'Reactivar')}
                            </button>
                          </div>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {modalCreateOpen && (
        <EmpleadoModal title="Crear empleado" onClose={() => setModalCreateOpen(false)}>
          <form onSubmit={handleCreateSubmit} noValidate>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label" htmlFor="create-nombres">Nombres</label>
                <input
                  id="create-nombres"
                  className="form-control"
                  value={createForm.nombres}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, nombres: e.target.value }))}
                />
                {formErrors.create.nombres && <small className="text-danger">{formErrors.create.nombres}</small>}
              </div>
              <div className="col-md-6">
                <label className="form-label" htmlFor="create-apellidos">Apellidos</label>
                <input
                  id="create-apellidos"
                  className="form-control"
                  value={createForm.apellidos}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, apellidos: e.target.value }))}
                />
                {formErrors.create.apellidos && <small className="text-danger">{formErrors.create.apellidos}</small>}
              </div>
              <div className="col-md-6">
                <label className="form-label" htmlFor="create-correo">Correo</label>
                <input
                  id="create-correo"
                  type="email"
                  className="form-control"
                  value={createForm.correo}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, correo: e.target.value }))}
                />
                {formErrors.create.correo && <small className="text-danger">{formErrors.create.correo}</small>}
              </div>
              <div className="col-md-6">
                <label className="form-label" htmlFor="create-password">Password</label>
                <input
                  id="create-password"
                  type="password"
                  className="form-control"
                  value={createForm.password}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, password: e.target.value }))}
                />
                {formErrors.create.password && <small className="text-danger">{formErrors.create.password}</small>}
              </div>
            </div>

            <div className="mt-4 d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-outline-secondary" onClick={() => setModalCreateOpen(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-signin" disabled={Boolean(actionLoadingById.create)}>
                {actionLoadingById.create ? 'Guardando...' : 'Crear empleado'}
              </button>
            </div>
          </form>
        </EmpleadoModal>
      )}

      {modalEditOpen && (
        <EmpleadoModal title="Editar empleado" onClose={() => setModalEditOpen(false)}>
          <form onSubmit={handleEditSubmit} noValidate>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label" htmlFor="edit-nombres">Nombres</label>
                <input
                  id="edit-nombres"
                  className="form-control"
                  value={editForm.nombres}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, nombres: e.target.value }))}
                />
                {formErrors.edit.nombres && <small className="text-danger">{formErrors.edit.nombres}</small>}
              </div>
              <div className="col-md-6">
                <label className="form-label" htmlFor="edit-apellidos">Apellidos</label>
                <input
                  id="edit-apellidos"
                  className="form-control"
                  value={editForm.apellidos}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, apellidos: e.target.value }))}
                />
                {formErrors.edit.apellidos && <small className="text-danger">{formErrors.edit.apellidos}</small>}
              </div>
              <div className="col-md-8">
                <label className="form-label" htmlFor="edit-correo">Correo</label>
                <input
                  id="edit-correo"
                  type="email"
                  className="form-control"
                  value={editForm.correo}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, correo: e.target.value }))}
                />
                {formErrors.edit.correo && <small className="text-danger">{formErrors.edit.correo}</small>}
              </div>
              <div className="col-md-4 d-flex align-items-end">
                <div className="form-check mb-2">
                  <input
                    id="edit-activo"
                    type="checkbox"
                    className="form-check-input"
                    checked={Boolean(editForm.activo)}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, activo: e.target.checked }))}
                  />
                  <label htmlFor="edit-activo" className="form-check-label">Activo</label>
                </div>
              </div>
            </div>

            <div className="mt-4 d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-outline-secondary" onClick={() => setModalEditOpen(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-signin" disabled={Boolean(actionLoadingById[`edit-${editForm.id}`])}>
                {actionLoadingById[`edit-${editForm.id}`] ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </EmpleadoModal>
      )}
    </section>
  );
}
