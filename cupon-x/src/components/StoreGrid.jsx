import React, { useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Spinner, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import StoreCard from "./StoreCard";
import "../styles/storegrid.css";
import { getTopEmpresas } from "../services/api";

const StoreGrid = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [empresas, setEmpresas] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await getTopEmpresas(6);
        const payload = Array.isArray(res?.data) ? res.data : [];

        setEmpresas(payload);
      } catch (e) {
        setError(e?.message || "Error cargando empresas");
        setEmpresas([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // Adaptar al formato que usa StoreCard
  const adapted = useMemo(() => {
    return (empresas || []).map((e) => ({
      id: e.id,
      nombre: e.nombre,
      rubro: e.rubro_nombre || "—",
      descripcion: e.descripcion || "Sin descripción",
      reward: e.reward_pct ?? 0,
      color: e.color_hex || "#333333",
    }));
  }, [empresas]);

  if (loading) {
    return (
      <section className="store-grid-section py-5">
        <Container>
          <Spinner animation="border" size="sm" />
          <span className="ms-2">Cargando stores...</span>
        </Container>
      </section>
    );
  }

  if (error) {
    return (
      <section className="store-grid-section py-5">
        <Container>
          <Alert variant="danger">{error}</Alert>
        </Container>
      </section>
    );
  }

  return (
    <section className="store-grid-section py-5">
      <Container>
        {/* Header Top Stores (igual al de cupones) */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold mb-0">
            Top <span style={{ color: "#c1121f" }}>Stores</span>
          </h2>

          <Link
            to="/stores"
            className="text-decoration-none fw-semibold"
            style={{ color: "#1f4e79" }}
          >
            See All Stores
          </Link>
        </div>

        <Row className="g-4">
          {adapted.length === 0 ? (
            <Col>
              <Alert variant="info" className="mb-0">
                No hay empresas disponibles.
              </Alert>
            </Col>
          ) : (
            adapted.map((item) => (
              <Col key={item.id} xs={12} sm={6} md={4} lg={2}>
                {/* lg=2 => 6 por fila en desktop */}
                <StoreCard data={item} />
              </Col>
            ))
          )}
        </Row>
      </Container>
    </section>
  );
};

export default StoreGrid;