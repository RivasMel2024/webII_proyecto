import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FaChartLine, FaCheckCircle, FaCoins, FaReceipt, FaSyncAlt, FaTag, FaTicketAlt } from 'react-icons/fa';
import { getMisMetricas } from '../services/api';
import '../styles/empresa-panel.css';

const fallbackMetricas = {
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

const formatCurrency = (value) =>
  new Intl.NumberFormat('es-SV', { style: 'currency', currency: 'USD' }).format(Number(value || 0));

const toMetricasErrorMessage = (message) => {
  const text = String(message || '');
  const lower = text.toLowerCase();
  if (lower.includes('no autorizado') || lower.includes('403')) return 'No autorizado para esta acción.';
  if (lower.includes('transición inválida') || lower.includes('transicion invalida') || lower.includes('409')) {
    return 'Transición inválida para el estado actual.';
  }
  return text || 'No se pudieron cargar las métricas.';
};

export default function EmpresaMetricasPage() {
  const [metricasData, setMetricasData] = useState(fallbackMetricas);
  const [loadingMetricas, setLoadingMetricas] = useState(true);
  const [errorMetricas, setErrorMetricas] = useState('');
  const [refreshedAt, setRefreshedAt] = useState(null);

  const loadMetricas = useCallback(async () => {
    setLoadingMetricas(true);
    setErrorMetricas('');
    try {
      const response = await getMisMetricas();
      setMetricasData(response?.data || fallbackMetricas);
      setRefreshedAt(new Date());
    } catch (err) {
      setErrorMetricas(toMetricasErrorMessage(err.message));
    } finally {
      setLoadingMetricas(false);
    }
  }, []);

  useEffect(() => {
    loadMetricas();
  }, [loadMetricas]);

  const estadoEntries = useMemo(() => {
    const raw = metricasData?.por_estado || fallbackMetricas.por_estado;
    const list = [
      { key: 'en_espera', label: 'En espera', value: Number(raw.en_espera || 0) },
      { key: 'aprobada', label: 'Aprobada', value: Number(raw.aprobada || 0) },
      { key: 'rechazada', label: 'Rechazada', value: Number(raw.rechazada || 0) },
      { key: 'descartada', label: 'Descartada', value: Number(raw.descartada || 0) },
    ];
    return list;
  }, [metricasData]);

  const maxEstado = useMemo(() => {
    return estadoEntries.reduce((acc, item) => (item.value > acc.value ? item : acc), estadoEntries[0]);
  }, [estadoEntries]);

  const kpis = [
    {
      key: 'total_ofertas',
      title: 'Total de ofertas',
      value: Number(metricasData.total_ofertas || 0).toLocaleString('es-SV'),
      icon: <FaTag />,
      badge: `${Number(metricasData.tasa_aprobacion || 0).toFixed(1)}% aprobadas`,
      tone: 'var(--color-primary)',
    },
    {
      key: 'cupones_vendidos_total',
      title: 'Cupones vendidos',
      value: Number(metricasData.cupones_vendidos_total || 0).toLocaleString('es-SV'),
      icon: <FaTicketAlt />,
      badge: `Dominante: ${maxEstado?.label || '-'}`,
      tone: 'var(--color-primary-dark)',
    },
    {
      key: 'ingresos_totales',
      title: 'Ingresos totales',
      value: formatCurrency(metricasData.ingresos_totales),
      icon: <FaCoins />,
      badge: 'Basado en cupones pagados',
      tone: 'var(--color-secondary)',
    },
    {
      key: 'ticket_promedio',
      title: 'Ticket promedio',
      value: formatCurrency(metricasData.ticket_promedio),
      icon: <FaReceipt />,
      badge: 'Ingresos / cupones vendidos',
      tone: 'var(--color-text)',
    },
  ];

  return (
    <section className="container py-4 empresa-panel-page">
      <header className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div className="empresa-panel-header w-100">
          <h1 className="h3 mb-1 empresa-panel-title">Métricas de empresa</h1>
          <p className="mb-0" style={{ color: 'var(--color-text)', opacity: 0.8 }}>
            Rendimiento de ofertas y ventas en tiempo real.
          </p>
          <small className="text-muted">
            Última actualización:{' '}
            {refreshedAt ? refreshedAt.toLocaleString('es-SV') : 'sin datos todavía'}
          </small>
        </div>

        <button type="button" className="btn btn-outline-primary d-flex align-items-center gap-2" onClick={loadMetricas} disabled={loadingMetricas}>
          <FaSyncAlt />
          {loadingMetricas ? 'Actualizando...' : 'Actualizar'}
        </button>
      </header>

      {errorMetricas && <div className="alert alert-danger py-2">{errorMetricas}</div>}

      <div className="row g-3 mb-4">
        {kpis.map((kpi) => {
          const progressValue = Math.min(100, Math.max(8, Number(metricasData.tasa_aprobacion || 0)));

          return (
            <div key={kpi.key} className="col-12 col-md-6 col-xl-3">
              <article
                className="h-100 p-3 rounded border empresa-soft-card"
                style={{
                  background: 'linear-gradient(130deg, #ffffff 0%, rgba(255, 253, 247, 0.95) 100%)',
                  borderColor: 'rgba(0, 48, 73, 0.08)',
                  boxShadow: '0 10px 20px rgba(0, 48, 73, 0.08)',
                }}
              >
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <span className="small fw-semibold" style={{ color: 'var(--color-text)' }}>
                    {kpi.title}
                  </span>
                  <span
                    className="d-inline-flex align-items-center justify-content-center rounded-circle"
                    style={{ width: 34, height: 34, backgroundColor: kpi.tone, color: 'white' }}
                  >
                    {kpi.icon}
                  </span>
                </div>

                <div className="display-6 fw-bold mb-1" style={{ color: 'var(--color-text)', fontSize: '1.7rem' }}>
                  {kpi.value}
                </div>

                <div className="d-flex align-items-center gap-2 mb-2">
                  <FaChartLine style={{ color: 'var(--color-secondary)' }} />
                  <small className="text-muted">{kpi.badge}</small>
                </div>

                <div className="progress" style={{ height: 6 }}>
                  <div
                    className="progress-bar"
                    role="progressbar"
                    style={{ width: `${progressValue}%`, backgroundColor: kpi.tone }}
                    aria-valuenow={progressValue}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  />
                </div>
              </article>
            </div>
          );
        })}
      </div>

      <section className="p-3 empresa-soft-card mb-4" style={{ backgroundColor: '#fff' }}>
        <h2 className="h5 mb-3">Estado de ofertas</h2>
        <div className="d-flex flex-wrap gap-2 mb-3">
          {estadoEntries.map((item) => (
            <span key={item.key} className="badge text-bg-light border px-3 py-2 empresa-chip">
              {item.label}: {item.value}
            </span>
          ))}
        </div>

        <div className="d-flex flex-column gap-2">
          {estadoEntries.map((item) => {
            const total = Number(metricasData.total_ofertas || 0);
            const width = total > 0 ? (item.value / total) * 100 : 0;

            return (
              <div key={`bar-${item.key}`}>
                <div className="d-flex justify-content-between small mb-1">
                  <span>{item.label}</span>
                  <span>{item.value}</span>
                </div>
                <div className="progress" style={{ height: 8 }}>
                  <div
                    className="progress-bar"
                    role="progressbar"
                    style={{ width: `${width}%`, backgroundColor: 'var(--color-secondary)' }}
                    aria-valuenow={width}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="p-3 border rounded empresa-soft-card" style={{ backgroundColor: 'rgba(102, 155, 188, 0.08)' }}>
        <h2 className="h5 d-flex align-items-center gap-2 mb-2">
          <FaCheckCircle style={{ color: 'var(--color-primary)' }} /> Insight rápido
        </h2>
        <p className="mb-0">
          Estado dominante: <strong>{maxEstado?.label || '-'}</strong>. Tasa de aprobación actual:{' '}
          <strong>{Number(metricasData.tasa_aprobacion || 0).toFixed(1)}%</strong>.
        </p>
      </section>
    </section>
  );
}
