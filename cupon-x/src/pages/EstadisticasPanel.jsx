import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { getAdminStatsApi } from '../services/api';

const EstadisticasPanel = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getAdminStatsApi();
        if (res.success) setStats(res.data);
      } catch (err) {
        setError("No se pudieron cargar las estadísticas financieras.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div className="estadisticas-panel p-3">
      <h4 className="mb-4 fw-bold">Análisis de Rendimiento</h4>

      <Row className="g-4">

        {/* 🔵 Ventas */}
        <Col xs={12} sm={6} lg={3}>
          <Card className="stat-card stat-card-blue">
            <Card.Body>
              <div className="stat-label">Ventas Brutas</div>
              <div className="stat-value">
                ${Number(stats.ingresos_totales || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}
              </div>
              <div className="stat-subtle">Ingresos generados</div>
            </Card.Body>
          </Card>
        </Col>

        {/* 🔴 Comisión */}
        <Col md={3}>
          <Card className="stat-card stat-card-red">
            <Card.Body>
              <div className="stat-label">Comisión Cuponera</div>
              <div className="stat-value highlight">
                ${Number(stats.comisiones_totales || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}
              </div>
              <div className="stat-subtle">Ganancia neta</div>
            </Card.Body>
          </Card>
        </Col>

        {/* ⚪ Cupones */}
        <Col md={3}>
          <Card className="stat-card stat-card-gray">
            <Card.Body>
              <div className="stat-label">Cupones Vendidos</div>
              <div className="stat-value">
                {stats.total_cupones_vendidos}
              </div>
              <div className="stat-subtle">
                {stats.clientes_activos} clientes únicos
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* 🟡/🟢 Pendientes */}
        <Col md={3}>
          <Card className="stat-card stat-card-status">
            <Card.Body>
              <div className="stat-label">Revisiones</div>
              <div className={`stat-value ${stats.ofertas_pendientes > 0 ? 'warning' : 'success'}`}>
                {stats.ofertas_pendientes}
              </div>
              <div className="stat-subtle">
                {stats.ofertas_pendientes > 0 ? "Acción requerida" : "Todo al día"}
              </div>
            </Card.Body>
          </Card>
        </Col>

      </Row>
    </div>
  );
};

export default EstadisticasPanel;