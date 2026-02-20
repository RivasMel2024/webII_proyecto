import React, { useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Spinner, Alert, Form } from "react-bootstrap";
import StoreCard from "../components/StoreCard";
import { getAllEmpresas } from "../services/api";

export default function StoresPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [empresas, setEmpresas] = useState([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await getAllEmpresas();
        const data = Array.isArray(res?.data) ? res.data : [];
        setEmpresas(data);
      } catch (e) {
        setError(e?.message || "Error cargando empresas");
        setEmpresas([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const adapted = useMemo(() => {
    const list = (empresas || []).map((e) => ({
      id: e.id,
      nombre: e.nombre,
      rubro: e.rubro_nombre || "—",
      descripcion: e.descripcion || "Sin descripción",
      reward: e.reward_pct ?? 0,
      color: e.color_hex || "#333333",
    }));

    const term = q.trim().toLowerCase();
    if (!term) return list;

    return list.filter(
      (x) =>
        x.nombre.toLowerCase().includes(term) ||
        x.rubro.toLowerCase().includes(term) ||
        x.descripcion.toLowerCase().includes(term)
    );
  }, [empresas, q]);

  return (
    <section className="py-5">
    <Container>

        {/* Header igual a All Coupons */}
        <div className="mb-3">
        <h2 className="fw-bold">
            All <span style={{ color: "#c1121f" }}>Stores</span>
        </h2>
        </div>

        {/* Barra grande igual a Coupons */}
        <Form className="mb-4">
        <Form.Control
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar tienda, rubro o descripción..."
            style={{
            width: "100%",
            maxWidth: "100%",
            height: "45px",
            fontSize: "15px",
            }}
        />
        </Form>

        {loading && (
          <div className="py-4 text-center">
            <Spinner animation="border" size="sm" />
            <span className="ms-2">Cargando stores...</span>
          </div>
        )}

        {!loading && error && <Alert variant="danger">{error}</Alert>}

        {!loading && !error && (
          <Row className="g-4 justify-content-center">
            {adapted.length === 0 ? (
              <Col md={8}>
                <Alert variant="info" className="mb-0 text-center">
                  No hay empresas para mostrar.
                </Alert>
              </Col>
            ) : (
              adapted.map((item) => (
                <Col key={item.id} xs={12} sm={6} md={4} lg={4}>
                  {/* ✅ Igual que cupones (3 por fila en desktop) */}
                  <StoreCard data={item} />
                </Col>
              ))
            )}
          </Row>
        )}
      </Container>
    </section>
  );
}