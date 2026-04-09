import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createOferta, descartarOferta, getAuthUser, getEmpleados, getMisMetricas, getMisOfertas, reenviarOferta } from '../services/api';
import { Link } from 'react-router-dom';
import '../styles/empresa-panel.css';

const toModuleErrorMessage = (message) => {
  const text = String(message || '');
  const lower = text.toLowerCase();
  if (lower.includes('no autorizado') || lower.includes('403')) return 'No autorizado para esta acción.';
  if (lower.includes('transición inválida') || lower.includes('transicion invalida') || lower.includes('409')) {
    return 'Transición inválida para el estado actual.';
  }
  return text || 'Ocurrió un error al procesar la acción.';
};

function MetricasSection({ data, loading, error }) {
  return (
    <section className="mb-4 p-3 empresa-soft-card" style={{ backgroundColor: 'rgba(102, 155, 188, 0.08)' }}>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h2 className="h5 mb-0">Métricas</h2>
        <Link to="/empresa/metricas" className="btn btn-outline-primary btn-sm">Ver métricas completas</Link>
      </div>
      {loading && <p className="mb-1">Cargando métricas...</p>}
      {error && <p className="text-danger mb-1">{error}</p>}
      {!loading && !error && (
        <div className="row g-2">
          <div className="col-md-4">
            <div className="p-2 border rounded bg-white">
              <small className="text-muted d-block">Total ofertas</small>
              <strong>{data.total_ofertas ?? 0}</strong>
            </div>
          </div>
          <div className="col-md-4">
            <div className="p-2 border rounded bg-white">
              <small className="text-muted d-block">Cupones vendidos</small>
              <strong>{data.cupones_vendidos_total ?? 0}</strong>
            </div>
          </div>
          <div className="col-md-4">
            <div className="p-2 border rounded bg-white">
              <small className="text-muted d-block">Tasa aprobación</small>
              <strong>{Number(data.tasa_aprobacion ?? 0).toFixed(1)}%</strong>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

const initialOfferForm = {
  titulo: '',
  descripcion: '',
  precio_regular: '',
  precio_oferta: '',
  fecha_inicio_oferta: '',
  fecha_fin_oferta: '',
  fecha_limite_uso: '',
  cantidad_limite: '',
  otros_detalles: '',
  imagen_url: '',
};

function validateCreateOfferForm(form) {
  const formErrors = {};

  if (!form.titulo.trim()) formErrors.titulo = 'El título es requerido.';
  if (!form.descripcion.trim()) formErrors.descripcion = 'La descripción es requerida.';

  const precioRegular = Number(form.precio_regular);
  const precioOferta = Number(form.precio_oferta);

  if (!form.precio_regular || Number.isNaN(precioRegular) || precioRegular <= 0) {
    formErrors.precio_regular = 'Debe ser numérico y mayor a 0.';
  }
  if (!form.precio_oferta || Number.isNaN(precioOferta) || precioOferta <= 0) {
    formErrors.precio_oferta = 'Debe ser numérico y mayor a 0.';
  }
  if (!formErrors.precio_regular && !formErrors.precio_oferta && precioOferta >= precioRegular) {
    formErrors.precio_oferta = 'Debe ser menor que precio regular.';
  }

  const fechaInicio = new Date(form.fecha_inicio_oferta);
  const fechaFin = new Date(form.fecha_fin_oferta);
  const fechaLimiteUso = new Date(form.fecha_limite_uso);

  if (!form.fecha_inicio_oferta) formErrors.fecha_inicio_oferta = 'La fecha de inicio es requerida.';
  if (!form.fecha_fin_oferta) formErrors.fecha_fin_oferta = 'La fecha de fin es requerida.';
  if (!form.fecha_limite_uso) formErrors.fecha_limite_uso = 'La fecha límite de uso es requerida.';

  if (!formErrors.fecha_inicio_oferta && !formErrors.fecha_fin_oferta && fechaInicio > fechaFin) {
    formErrors.fecha_inicio_oferta = 'Debe ser menor o igual a fecha fin.';
  }

  if (!formErrors.fecha_fin_oferta && !formErrors.fecha_limite_uso && fechaLimiteUso < fechaFin) {
    formErrors.fecha_limite_uso = 'Debe ser mayor o igual a fecha fin.';
  }

  if (form.cantidad_limite !== '') {
    const cantidadLimite = Number(form.cantidad_limite);
    if (!Number.isInteger(cantidadLimite) || cantidadLimite <= 0) {
      formErrors.cantidad_limite = 'Debe ser un entero mayor a 0.';
    }
  }

  return formErrors;
}

function CrearOfertaSection({ data, loading, error, onOfertaCreada, refreshOfertas, canManage }) {
  const [form, setForm] = useState(initialOfferForm);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setSubmitError('');
    setSubmitSuccess('');
    setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting || !canManage) return;

    const validationErrors = validateCreateOfferForm(form);
    setFormErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');

    try {
      const payload = {
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim(),
        precio_regular: Number(form.precio_regular),
        precio_oferta: Number(form.precio_oferta),
        fecha_inicio_oferta: form.fecha_inicio_oferta,
        fecha_fin_oferta: form.fecha_fin_oferta,
        fecha_limite_uso: form.fecha_limite_uso,
        otros_detalles: form.otros_detalles.trim(),
        imagen_url: form.imagen_url.trim(),
      };

      if (form.cantidad_limite !== '') {
        payload.cantidad_limite = Number(form.cantidad_limite);
      }

      await createOferta(payload);
      setForm(initialOfferForm);
      setFormErrors({});
      setSubmitSuccess('Oferta creada correctamente en estado en espera de aprobación.');

      if (onOfertaCreada) {
        await onOfertaCreada();
      }
      if (refreshOfertas) {
        await refreshOfertas();
      }
    } catch (submitErr) {
      setSubmitError(toModuleErrorMessage(submitErr.message || 'No se pudo crear la oferta.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mb-4 p-3 empresa-soft-card">
      <h2 className="h5 mb-3">Crear oferta</h2>
      {loading && <p className="mb-1">Preparando formulario...</p>}
      {error && <p className="text-danger mb-1">{error}</p>}
      {!canManage && !loading && (
        <p className="text-muted mb-1">No autorizado para esta acción.</p>
      )}
      {!loading && !error && canManage && (
        <form onSubmit={handleSubmit} noValidate>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label" htmlFor="titulo">Título</label>
              <input id="titulo" name="titulo" className="form-control" value={form.titulo} onChange={handleChange} />
              {formErrors.titulo && <small className="text-danger">{formErrors.titulo}</small>}
            </div>

            <div className="col-md-6">
              <label className="form-label" htmlFor="imagen_url">Imagen URL (opcional)</label>
              <input id="imagen_url" name="imagen_url" className="form-control" value={form.imagen_url} onChange={handleChange} />
            </div>

            <div className="col-12">
              <label className="form-label" htmlFor="descripcion">Descripción</label>
              <textarea id="descripcion" name="descripcion" rows={3} className="form-control" value={form.descripcion} onChange={handleChange} />
              {formErrors.descripcion && <small className="text-danger">{formErrors.descripcion}</small>}
            </div>

            <div className="col-md-4">
              <label className="form-label" htmlFor="precio_regular">Precio regular</label>
              <input id="precio_regular" name="precio_regular" type="number" min="0" step="0.01" className="form-control" value={form.precio_regular} onChange={handleChange} />
              {formErrors.precio_regular && <small className="text-danger">{formErrors.precio_regular}</small>}
            </div>

            <div className="col-md-4">
              <label className="form-label" htmlFor="precio_oferta">Precio oferta</label>
              <input id="precio_oferta" name="precio_oferta" type="number" min="0" step="0.01" className="form-control" value={form.precio_oferta} onChange={handleChange} />
              {formErrors.precio_oferta && <small className="text-danger">{formErrors.precio_oferta}</small>}
            </div>

            <div className="col-md-4">
              <label className="form-label" htmlFor="cantidad_limite">Cantidad límite (opcional)</label>
              <input id="cantidad_limite" name="cantidad_limite" type="number" min="1" step="1" className="form-control" value={form.cantidad_limite} onChange={handleChange} />
              {formErrors.cantidad_limite && <small className="text-danger">{formErrors.cantidad_limite}</small>}
            </div>

            <div className="col-md-4">
              <label className="form-label" htmlFor="fecha_inicio_oferta">Fecha inicio oferta</label>
              <input id="fecha_inicio_oferta" name="fecha_inicio_oferta" type="date" className="form-control" value={form.fecha_inicio_oferta} onChange={handleChange} />
              {formErrors.fecha_inicio_oferta && <small className="text-danger">{formErrors.fecha_inicio_oferta}</small>}
            </div>

            <div className="col-md-4">
              <label className="form-label" htmlFor="fecha_fin_oferta">Fecha fin oferta</label>
              <input id="fecha_fin_oferta" name="fecha_fin_oferta" type="date" className="form-control" value={form.fecha_fin_oferta} onChange={handleChange} />
              {formErrors.fecha_fin_oferta && <small className="text-danger">{formErrors.fecha_fin_oferta}</small>}
            </div>

            <div className="col-md-4">
              <label className="form-label" htmlFor="fecha_limite_uso">Fecha límite uso</label>
              <input id="fecha_limite_uso" name="fecha_limite_uso" type="date" className="form-control" value={form.fecha_limite_uso} onChange={handleChange} />
              {formErrors.fecha_limite_uso && <small className="text-danger">{formErrors.fecha_limite_uso}</small>}
            </div>

            <div className="col-12">
              <label className="form-label" htmlFor="otros_detalles">Otros detalles (opcional)</label>
              <textarea id="otros_detalles" name="otros_detalles" rows={2} className="form-control" value={form.otros_detalles} onChange={handleChange} />
            </div>
          </div>

          {submitError && <p className="text-danger mt-3 mb-0">{submitError}</p>}
          {submitSuccess && <p className="text-success mt-3 mb-0">{submitSuccess}</p>}

          <div className="mt-3 d-flex align-items-center gap-2">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Creando oferta...' : 'Crear oferta'}
            </button>
            {data.note && <small className="text-muted">{data.note}</small>}
          </div>
        </form>
      )}
    </section>
  );
}

const ESTADOS_OFERTA = ['en_espera', 'aprobada', 'rechazada', 'descartada'];

function OffersByStatusSection({ onRefreshReady, canManage }) {
  const [selectedEstado, setSelectedEstado] = useState('en_espera');
  const [ofertasState, setOfertasState] = useState([]);
  const [loadingOfertas, setLoadingOfertas] = useState(true);
  const [errorOfertas, setErrorOfertas] = useState('');
  const [actionLoadingById, setActionLoadingById] = useState({});
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  const loadOfertasByEstado = useCallback(async (estado) => {
    setLoadingOfertas(true);
    setErrorOfertas('');
    try {
      const response = await getMisOfertas({ estado });
      setOfertasState(Array.isArray(response?.data) ? response.data : []);
    } catch (err) {
      setErrorOfertas(err.message || 'No se pudieron cargar las ofertas.');
      setOfertasState([]);
    } finally {
      setLoadingOfertas(false);
    }
  }, []);

  useEffect(() => {
    loadOfertasByEstado(selectedEstado);
  }, [selectedEstado, loadOfertasByEstado]);

  const refreshCurrentEstado = useCallback(async () => {
    await loadOfertasByEstado(selectedEstado);
  }, [loadOfertasByEstado, selectedEstado]);

  useEffect(() => {
    if (onRefreshReady) {
      onRefreshReady(refreshCurrentEstado);
    }
  }, [onRefreshReady, refreshCurrentEstado]);

  const handleEstadoChange = (estado) => {
    if (!ESTADOS_OFERTA.includes(estado)) return;
    setActionSuccess('');
    setActionError('');
    setSelectedEstado(estado);
  };

  const handleOfertaAction = async (ofertaId, actionType) => {
    if (!canManage || actionLoadingById[ofertaId]) return;
    setActionSuccess('');
    setActionError('');
    setActionLoadingById((prev) => ({ ...prev, [ofertaId]: true }));

    try {
      if (actionType === 'reenviar') {
        await reenviarOferta(ofertaId);
        setActionSuccess('Oferta reenviada correctamente.');
      } else {
        await descartarOferta(ofertaId);
        setActionSuccess('Oferta descartada correctamente.');
      }
      await loadOfertasByEstado(selectedEstado);
    } catch (err) {
      setActionError(toModuleErrorMessage(err.message || 'No se pudo completar la acción.'));
    } finally {
      setActionLoadingById((prev) => ({ ...prev, [ofertaId]: false }));
    }
  };

  return (
    <section className="mb-4 p-3 empresa-soft-card">
      <h2 className="h5 mb-3">Ofertas por estado</h2>

      <div className="d-flex flex-wrap gap-2 mb-3">
        {ESTADOS_OFERTA.map((estado) => (
          <button
            key={estado}
            type="button"
            className={`btn btn-sm ${selectedEstado === estado ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => handleEstadoChange(estado)}
            disabled={loadingOfertas}
          >
            {estado}
          </button>
        ))}
      </div>

      {loadingOfertas && <p className="mb-1">Cargando ofertas...</p>}
      {errorOfertas && <p className="text-danger mb-1">{errorOfertas}</p>}
      {actionError && <p className="text-danger mb-1">{actionError}</p>}
      {actionSuccess && <p className="text-success mb-1">{actionSuccess}</p>}

      {!loadingOfertas && !errorOfertas && (
        <div className="table-responsive">
          <table className="table table-sm align-middle mb-0">
            <thead>
              <tr>
                <th>Título</th>
                <th>Precio Regular</th>
                <th>Precio Oferta</th>
                <th>Inicio</th>
                <th>Fin</th>
                <th>Límite Uso</th>
                <th>Estado</th>
                <th>Razón Rechazo</th>
                <th>Cupones Vendidos</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ofertasState.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-muted">No hay ofertas para el estado seleccionado.</td>
                </tr>
              ) : (
                ofertasState.map((oferta) => (
                  <tr key={oferta.id}>
                    <td>{oferta.titulo || '-'}</td>
                    <td>{oferta.precio_regular ?? '-'}</td>
                    <td>{oferta.precio_oferta ?? '-'}</td>
                    <td>{oferta.fecha_inicio_oferta || '-'}</td>
                    <td>{oferta.fecha_fin_oferta || '-'}</td>
                    <td>{oferta.fecha_limite_uso || '-'}</td>
                    <td>{oferta.estado || '-'}</td>
                    <td>{oferta.razon_rechazo || '-'}</td>
                    <td>{oferta.cupones_vendidos ?? 0}</td>
                    <td>
                      {oferta.estado === 'rechazada' && canManage ? (
                        <div className="d-flex gap-2">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-success"
                            onClick={() => handleOfertaAction(oferta.id, 'reenviar')}
                            disabled={!!actionLoadingById[oferta.id]}
                          >
                            {actionLoadingById[oferta.id] ? 'Procesando...' : 'Reenviar'}
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleOfertaAction(oferta.id, 'descartar')}
                            disabled={!!actionLoadingById[oferta.id]}
                          >
                            {actionLoadingById[oferta.id] ? 'Procesando...' : 'Descartar'}
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
  );
}

function EmpleadosResumenSection({ data, loading, error }) {
  const totalEmpleados = Array.isArray(data) ? data.length : 0;
  const activos = Array.isArray(data) ? data.filter((empleado) => empleado.activo).length : 0;

  return (
    <section className="mb-2 p-3 empresa-soft-card">
      <h2 className="h5 mb-3">Resumen de empleados</h2>
      {loading && <p className="mb-1">Cargando empleados...</p>}
      {error && <p className="text-danger mb-1">{error}</p>}
      {!loading && !error && (
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <p className="mb-1">Total empleados: <strong>{totalEmpleados}</strong></p>
            <p className="mb-0">Activos: <strong>{activos}</strong></p>
          </div>
          <Link to="/empresa/empleados" className="btn btn-outline-primary btn-sm">
            Ir a gestión de empleados
          </Link>
        </div>
      )}
    </section>
  );
}

const metricasPlaceholder = {
  total_ofertas: 0,
  por_estado: {
    en_espera: 0,
    aprobada: 0,
    rechazada: 0,
    descartada: 0,
  },
  cupones_vendidos_total: 0,
  ingresos_totales: 0,
  tasa_aprobacion: 0,
  ticket_promedio: 0,
};

export default function EmpresaDashboardPage() {
  const canManage = getAuthUser()?.role === 'ADMIN_EMPRESA';
  const refreshOfertasRef = useRef(async () => {});
  const [loading, setLoading] = useState({
    metricas: true,
    empleados: true,
    crearOferta: false,
  });
  const [errors, setErrors] = useState({
    metricas: '',
    empleados: '',
    crearOferta: '',
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [data, setData] = useState({
    metricas: metricasPlaceholder,
    empleados: [],
  });

  useEffect(() => {
    let isMounted = true;

    const loadDashboardData = async () => {
      setSuccessMessage('');
      setLoading((prev) => ({ ...prev, metricas: true, empleados: true }));
      setErrors((prev) => ({ ...prev, metricas: '', empleados: '' }));

      const [metricasResult, empleadosResult] = await Promise.allSettled([
        getMisMetricas(),
        getEmpleados(),
      ]);

      if (!isMounted) return;

      if (metricasResult.status === 'fulfilled') {
        setData((prev) => ({
          ...prev,
          metricas: metricasResult.value?.data || metricasPlaceholder,
        }));
        setLoading((prev) => ({ ...prev, metricas: false }));
      } else {
        setErrors((prev) => ({ ...prev, metricas: 'No se pudieron cargar las métricas.' }));
        setLoading((prev) => ({ ...prev, metricas: false }));
      }

      if (empleadosResult.status === 'fulfilled') {
        setData((prev) => ({
          ...prev,
          empleados: Array.isArray(empleadosResult.value?.data) ? empleadosResult.value.data : [],
        }));
        setLoading((prev) => ({ ...prev, empleados: false }));
      } else {
        setErrors((prev) => ({ ...prev, empleados: empleadosResult.reason?.message || 'No se pudieron cargar los empleados.' }));
        setLoading((prev) => ({ ...prev, empleados: false }));
      }

      const hasAnyError =
        metricasResult.status === 'rejected' ||
        empleadosResult.status === 'rejected';

      setSuccessMessage(hasAnyError ? '' : 'Dashboard cargado.');
    };

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="container py-4 empresa-panel-page">
      <div className="d-flex justify-content-between align-items-center mb-3 empresa-panel-header">
        <h1 className="h3 mb-0 empresa-panel-title">Panel de empresa</h1>
      </div>

      {successMessage && (
        <div className="alert alert-success py-2" role="status">
          {successMessage}
        </div>
      )}

      <MetricasSection data={data.metricas} loading={loading.metricas} error={errors.metricas} />
      <CrearOfertaSection
        data={{ note: 'Tras crear, la oferta debe quedar en estado en espera.' }}
        loading={loading.crearOferta}
        error={errors.crearOferta}
        canManage={canManage}
        refreshOfertas={async () => refreshOfertasRef.current()}
      />
      <OffersByStatusSection canManage={canManage} onRefreshReady={(refreshFn) => { refreshOfertasRef.current = refreshFn; }} />
      <EmpleadosResumenSection data={data.empleados} loading={loading.empleados} error={errors.empleados} />
    </section>
  );
}
