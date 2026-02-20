import React, { useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Spinner, Alert, Form } from "react-bootstrap";
import CouponCard from "../components/CouponCard";
import { getAllOffers } from "../services/api";

const formatDateOnly = (d) => {
  if (!d) return "—";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString();
};

export default function CouponsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [offers, setOffers] = useState([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await getAllOffers();
        const payload = Array.isArray(res?.data) ? res.data : [];
        setOffers(payload);
      } catch (e) {
        setError(e?.message || "Error cargando ofertas");
        setOffers([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const adapted = useMemo(() => {
    return (offers || []).map((o) => ({
      id: o.oferta_id ?? o.id,
      brand: o.titulo || "Oferta",
      category: "Disponible",
      price: `$${Number(o.precio_oferta ?? 0).toFixed(2)}`,
      description: o.descripcion || "Sin descripción",
      code: "Oferta disponible",
      expiry: formatDateOnly(o.fecha_limite_uso),
    }));
  }, [offers]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return adapted;
    return adapted.filter((x) =>
      `${x.brand} ${x.description}`.toLowerCase().includes(term)
    );
  }, [q, adapted]);

  if (loading) {
    return (
      <Container className="py-5">
        <Spinner animation="border" size="sm" />
        <span className="ms-2">Cargando cupones...</span>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="mb-0">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <section className="py-5">
      <Container>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="fw-bold mb-0">All Coupons</h2>
        </div>

        <Form className="mb-4">
          <Form.Control
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre o descripción..."
          />
        </Form>

        <Row className="g-4">
          {filtered.length === 0 ? (
            <Col>
              <Alert variant="info" className="mb-0">
                No hay cupones para mostrar.
              </Alert>
            </Col>
          ) : (
            filtered.map((item) => (
              <Col key={item.id} xs={12} sm={6} md={4}>
                <CouponCard data={item} />
              </Col>
            ))
          )}
        </Row>
      </Container>
    </section>
  );
}
