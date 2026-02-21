import React, { useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Spinner, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import CouponCard from "./CouponCard";
import "../styles/coupongrid.css";
import { getTopOffers } from "../services/api";

const formatDateOnly = (d) => {
  if (!d) return "—";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString();
};

const CouponGrid = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await getTopOffers(3);
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

  // Adaptar ofertas al formato de tu CouponCard
const adapted = useMemo(() => {
  return (offers || []).map((o) => ({
    id: o.oferta_id ?? o.id,
    brand: o.titulo || "Oferta",
    category: "Disponible",
    price: `$${Number(o.precio_oferta ?? 0).toFixed(2)}`,
    description: o.descripcion || "Sin descripción",
    code: "Oferta disponible",
    expiry: formatDateOnly(o.fecha_limite_uso),
    // Agregar datos completos para el carrito
    titulo: o.titulo || "Oferta",
    descripcion: o.descripcion || "Sin descripción",
    precio_oferta: Number(o.precio_oferta ?? 0),
    fecha_limite_uso: formatDateOnly(o.fecha_limite_uso),
  }));
}, [offers]);


  if (loading) {
    return (
      <section className="coupon-grid-section">
        <Container className="py-4">
          <Spinner animation="border" size="sm" />
          <span className="ms-2">Cargando ofertas...</span>
        </Container>
      </section>
    );
  }

  if (error) {
    return (
      <section className="coupon-grid-section">
        <Container className="py-4">
          <Alert variant="danger">{error}</Alert>
        </Container>
      </section>
    );
  }

  return (
    <section className="coupon-grid-section py-5">
      <Container>

        {/* Header Top Coupons */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold mb-0">
            Top <span style={{ color: "#c1121f" }}>Coupons</span>
          </h2>

          <Link
            to="/coupons"
            className="text-decoration-none fw-semibold"
            style={{ color: "#1f4e79" }}
          >
            See All Coupons
          </Link>
        </div>

        <Row className="g-4">
          {adapted.length === 0 ? (
            <Col>
              <Alert variant="info" className="mb-0">
                No hay ofertas disponibles.
              </Alert>
            </Col>
          ) : (
            adapted.map((item) => (
              <Col key={item.id} xs={12} sm={6} md={4} lg={4}>
                <CouponCard data={item} />
              </Col>
            ))
          )}
        </Row>

      </Container>
    </section>
  );
};

export default CouponGrid;
