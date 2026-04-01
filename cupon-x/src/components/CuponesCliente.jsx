import { useEffect, useMemo, useState } from "react";
import { Card, Button, Badge, Spinner } from "react-bootstrap";
import {
  FaCalendarAlt,
  FaTicketAlt,
  FaCheckCircle,
  FaTrashAlt,
  FaCopy,
} from "react-icons/fa";
import { getCuponesByCliente, deleteCupon } from "../services/api";
import "../styles/cuponescliente.css";

export default function CuponesCliente({ clienteId }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cupones, setCupones] = useState([]);
  const [copiado, setCopiado] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const total = cupones.length;

  const subtitle = useMemo(() => {
    if (!clienteId) return "Seleccioná un cliente para ver sus cupones";
    if (loading) return "Cargando información…";
    if (error) return "Hubo un problema al cargar";
    return `${total} cupón${total === 1 ? "" : "es"} encontrado${total === 1 ? "" : "s"}`;
  }, [clienteId, loading, error, total]);

  const fmtDateOnly = (d) => {
    if (!d) return "—";
    const date = new Date(d);
    if (Number.isNaN(date.getTime())) return String(d);
    return date.toLocaleDateString();
  };

  const fmtMoney = (n) => {
    const num = Number(n);
    if (Number.isNaN(num)) return "0.00";
    return num.toFixed(2);
  };

  const estadoBadge = (estado) => {
    const e = (estado || "").toLowerCase();
    if (e === "disponible") return <Badge bg="success">disponible</Badge>;
    if (e === "canjeado") return <Badge bg="secondary">canjeado</Badge>;
    if (e === "vencido") return <Badge bg="danger">vencido</Badge>;
    return <Badge bg="dark">{estado || "N/A"}</Badge>;
  };

  const loadCupones = async (id) => {
    try {
      if (!id) {
        setCupones([]);
        setError("");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      const result = await getCuponesByCliente(id);
      if (!result?.success) {
        throw new Error(result?.message || "No se pudieron cargar los cupones");
      }

      setCupones(result.data || []);
    } catch (e) {
      setError(e?.message || "Error inesperado");
      setCupones([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!mounted) return;
      await loadCupones(clienteId);
    })();
    return () => {
      mounted = false;
    };
  }, [clienteId]);

  const copiarCodigo = async (codigo) => {
    try {
      await navigator.clipboard.writeText(codigo);
      setCopiado(codigo);
      setTimeout(() => setCopiado(""), 1200);
    } catch {
      setCopiado("");
    }
  };

  // const onDelete = async (id) => {
  //   const ok = window.confirm(`¿Seguro que querés eliminar el cupón #${id}?`);
  //   if (!ok) return;

  //   try {
  //     setDeletingId(id);
  //     setError("");

  //     const res = await deleteCupon(id);
  //     if (!res?.success) throw new Error(res?.message || "No se pudo eliminar");

  //     setCupones((prev) => prev.filter((c) => c.id !== id));
  //   } catch (e) {
  //     setError(e?.message || "Error eliminando el cupón");
  //   } finally {
  //     setDeletingId(null);
  //   }
  // };

  return (
  <div className="container my-4 cupones-clientes-wrap">
    {/* Header */}
    <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mb-4">
      <div>
        <h2 className="m-0 fw-semibold" style={{ color: "#2c2c2c" }}>
          Cupones del Cliente <span className="text-muted">#{clienteId ?? "—"}</span>
        </h2>
        <div className="text-muted small mt-1">{subtitle}</div>
      </div>

      <Button
        variant="outline-secondary"
        size="sm"
        onClick={() => loadCupones(clienteId)}
        disabled={loading}
      >
        Recargar
      </Button>
    </div>

    {/* Estados */}
    {loading && (
      <div className="alert d-flex align-items-center gap-2" style={{ background: "#f5f7fa", border: "none" }}>
        <Spinner animation="border" size="sm" />
        <span>Cargando cupones...</span>
      </div>
    )}

    {error && (
      <div className="alert" style={{ background: "#fff5f5", color: "#842029", border: "none" }}>
        <strong>Error:</strong> {error}
      </div>
    )}

    {!loading && !error && total === 0 && (
      <div className="alert" style={{ background: "#fff8e6", border: "none" }}>
        No hay cupones para este cliente.
      </div>
    )}

    {/* Grid */}
    {!loading && !error && total > 0 && (
      <div className="row g-4">
        {cupones.map((c) => (
          <div className="col-12 col-md-6 col-lg-4" key={`${c.id}-${c.codigo}`}>
            <Card className="h-100 border-0 shadow-sm" style={{ borderRadius: "10px" }}>
              <Card.Body className="d-flex flex-column p-4">

                {/* Top info */}
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div className="d-flex flex-wrap gap-2">
                    <span className="badge bg-light text-dark fw-normal">
                      {(c.empresa_nombre || "Empresa").toUpperCase()}
                    </span>
                    <span className="badge bg-secondary-subtle text-dark fw-normal">
                      {(c.oferta_titulo || "Oferta").toUpperCase()}
                    </span>
                  </div>

                  {/* Estado */}
                  <div>
                    {(c.estado || "").toLowerCase() === "disponible" && (
                      <Badge bg="success-subtle" text="success">Disponible</Badge>
                    )}
                    {(c.estado || "").toLowerCase() === "canjeado" && (
                      <Badge bg="secondary">Canjeado</Badge>
                    )}
                    {(c.estado || "").toLowerCase() === "vencido" && (
                      <Badge bg="danger-subtle" text="danger">Vencido</Badge>
                    )}
                  </div>
                </div>

                {/* Precio */}
                <h3 style={{ fontWeight: "600", color: "#1f1f1f" }}>
                  ${fmtMoney(c.precio_pagado)}
                </h3>

                {/* Descripción */}
                <p className="text-muted small mt-2">
                  <FaCheckCircle className="me-2 text-success" />
                  {c.oferta_descripcion || "Oferta disponible para el cliente."}
                </p>

                {/* Código */}
                <div
                  className="d-flex align-items-center mt-3 p-2"
                  style={{
                    background: "#f8f9fa",
                    borderRadius: "8px"
                  }}
                >
                  <FaTicketAlt className="me-2 text-muted" />
                  <span className="fw-semibold">{c.codigo}</span>

                  <Button
                    variant="light"
                    size="sm"
                    className="ms-auto"
                    onClick={() => copiarCodigo(c.codigo)}
                    type="button"
                  >
                    <FaCopy className="me-1" />
                    {copiado === c.codigo ? "Copiado" : "Copiar"}
                  </Button>
                </div>

                {/* Fecha */}
                <div className="text-muted small mt-3">
                  <FaCalendarAlt className="me-2" />
                  Vence: {fmtDateOnly(c.fecha_limite_uso)}
                </div>

                {/* Footer info */}
                <div className="small text-muted mt-3">
                  <strong>ID:</strong> {c.id} &nbsp;•&nbsp; <strong>Cliente:</strong> {c.cliente_id}
                </div>

              </Card.Body>
            </Card>
          </div>
        ))}
      </div>
    )}
  </div>
);
}
