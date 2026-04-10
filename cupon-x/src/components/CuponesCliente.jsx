import { useEffect, useMemo, useState } from "react";
import { Card, Button, Badge, Spinner } from "react-bootstrap";
import {
  FaCalendarAlt,
  FaTicketAlt,
  FaCheckCircle,
  FaTrashAlt,
  FaCopy,
  FaFilePdf,
} from "react-icons/fa";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import { getCuponesByCliente, deleteCupon } from "../services/api";
import "../styles/cuponescliente.css";

export default function CuponesCliente({ clienteId, clienteNombre }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cupones, setCupones] = useState([]);
  const [copiado, setCopiado] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [showCodigoById, setShowCodigoById] = useState({});
  const [qrByCodigo, setQrByCodigo] = useState({});

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

  useEffect(() => {
    let mounted = true;

    const generarQrs = async () => {
      const entries = await Promise.all(
        cupones.map(async (c) => {
          try {
            const qrPayload = JSON.stringify({
              codigo: c.codigo || null,
              empresa: c.empresa_nombre || null,
              oferta: c.oferta_titulo || null,
              estado: c.estado || null,
              fecha_limite_uso: c.fecha_limite_uso || null,
            });

            const qrDataUrl = await QRCode.toDataURL(qrPayload, {
              errorCorrectionLevel: "M",
              margin: 1,
              width: 180,
            });
            return [c.codigo, qrDataUrl];
          } catch {
            return [c.codigo, ""];
          }
        })
      );

      if (!mounted) return;
      setQrByCodigo(Object.fromEntries(entries.filter(([key]) => Boolean(key))));
    };

    if (cupones.length) {
      void generarQrs();
    } else {
      setQrByCodigo({});
    }

    return () => {
      mounted = false;
    };
  }, [cupones]);

  const copiarCodigo = async (codigo) => {
    try {
      await navigator.clipboard.writeText(codigo);
      setCopiado(codigo);
      setTimeout(() => setCopiado(""), 1200);
    } catch {
      setCopiado("");
    }
  };

  const toggleCodigo = (id) => {
    setShowCodigoById((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const maskCodigo = (codigo = "") => {
    const raw = String(codigo);
    if (raw.length <= 4) return raw;
    return `${"*".repeat(raw.length - 4)}${raw.slice(-4)}`;
  };

  const descargarCuponPDF = async (cupon) => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });

    doc.setFillColor(6, 40, 61);
    doc.rect(0, 0, 210, 35, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("CuponX - Cupón", 14, 22);

    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    const yStart = 50;
    const lineGap = 10;
    const fields = [
      ["Código", cupon.codigo || "N/A"],
      ["Empresa", cupon.empresa_nombre || "N/A"],
      ["Oferta", cupon.oferta_titulo || "N/A"],
      ["Precio pagado", `$${fmtMoney(cupon.precio_pagado)}`],
      ["Estado", cupon.estado || "N/A"],
      ["Fecha compra", fmtDateOnly(cupon.fecha_compra)],
      ["Fecha límite de uso", fmtDateOnly(cupon.fecha_limite_uso)],
    ];

    fields.forEach(([label, value], index) => {
      const y = yStart + (index * lineGap);
      doc.setFont("helvetica", "bold");
      doc.text(`${label}:`, 14, y);
      doc.setFont("helvetica", "normal");
      doc.text(String(value), 62, y);
    });

    try {
      const qrPayload = JSON.stringify({
        codigo: cupon.codigo || null,
        empresa: cupon.empresa_nombre || null,
        oferta: cupon.oferta_titulo || null,
        estado: cupon.estado || null,
        fecha_limite_uso: cupon.fecha_limite_uso || null,
      });
      const qrImage = await QRCode.toDataURL(qrPayload, {
        errorCorrectionLevel: "M",
        margin: 1,
        width: 300,
      });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(40, 40, 40);
      doc.text("Código QR del cupón", 142, 46);
      doc.addImage(qrImage, "PNG", 142, 50, 52, 52);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text("Escanea para ver los datos del cupón", 142, 106);
    } catch {
      // Si el QR falla, no bloqueamos la descarga del PDF.
    }

    doc.setDrawColor(44, 123, 229);
    doc.setLineWidth(0.6);
    doc.roundedRect(12, 40, 186, 88, 3, 3);

    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(
      "Presenta este PDF o el código del cupón al momento de canjear.",
      14,
      140
    );

    const fileCode = String(cupon.codigo || `cupon-${cupon.id || "x"}`)
      .replace(/[^a-zA-Z0-9_-]/g, "")
      .slice(0, 40);
    doc.save(`cupon-${fileCode}.pdf`);
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
    <div className="container my-4 cupones-clientes-wrap coupon-page-shell">
      {/* Header */}
      <div className="coupon-page-header d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div className="coupon-header-copy">
          <div className="coupon-header-kicker">Wallet de cupones</div>
          <h2 className="m-0 cupones-title">
            {clienteNombre ? `Cupones de ${clienteNombre}` : <>Cupones del Cliente <span className="coupon-client-id">#{clienteId ?? "—"}</span></>}
          </h2>
          <div className="coupon-header-subtitle">{subtitle}</div>
        </div>

        <Button
          variant="primary"
          size="sm"
          className="coupon-refresh-btn"
          onClick={() => loadCupones(clienteId)}
          disabled={loading}
        >
          Recargar
        </Button>
      </div>

      {/* Estados */}
      {loading && (
        <div className="alert alert-info d-flex align-items-center gap-2">
          <Spinner animation="border" size="sm" /> Cargando cupones...
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          <strong>Error:</strong> {error}
        </div>
      )}

      {!loading && !error && total === 0 && (
        <div className="alert alert-warning">No hay cupones para este cliente.</div>
      )}

      {/* Grid de Cards (estilo Top Coupons) */}
      {!loading && !error && total > 0 && (
        <div className="row g-4 coupon-grid-pro">
          {cupones.map((c) => (
            <div className="col-12 col-md-6 col-lg-4" key={`${c.id}-${c.codigo}`}>
              <Card className="coupon-card h-100 coupon-card-pro">
                <Card.Body className="d-flex flex-column p-4">
                  {/* Top info: “marca” + estado */}
                  <div className="coupon-top-info d-flex align-items-start justify-content-between gap-3 mb-3">
                    <div className="d-flex flex-column gap-2 flex-grow-1">
                      <span className="coupon-brand-tag">{(c.empresa_nombre || "Empresa").toUpperCase()}</span>
                      <span className="coupon-category-tag">{(c.oferta_titulo || "Oferta").toUpperCase()}</span>
                    </div>
                    {estadoBadge(c.estado)}
                  </div>

                  {/* “Precio” grande (para que se parezca al diseño) */}
                  <h3 className="coupon-price-value">
                    ${fmtMoney(c.precio_pagado)} <span className="coupon-off">OFF</span>
                  </h3>

                  {/* Descripción con check */}
                  <div className="coupon-description-box">
                    <p className="coupon-text-desc">
                      <FaCheckCircle className="me-2 text-success" />
                      {c.oferta_descripcion || "Oferta disponible para el cliente."}
                    </p>
                  </div>

                  {/* Código */}
                  <div className="coupon-code-container">
                    <div className="coupon-code-main">
                      <div className="coupon-code-line">
                        <FaTicketAlt className="code-icon-style" />
                        <span className="code-font">
                          {showCodigoById[c.id] ? c.codigo : maskCodigo(c.codigo)}
                        </span>
                      </div>
                      <Button
                        variant="link"
                        size="sm"
                        className="coupon-toggle-btn"
                        onClick={() => toggleCodigo(c.id)}
                        type="button"
                      >
                        {showCodigoById[c.id] ? "Ocultar código" : "Ver código"}
                      </Button>
                    </div>

                    <div className="coupon-qr-box" title="QR del cupón">
                      {qrByCodigo[c.codigo] ? (
                        <img src={qrByCodigo[c.codigo]} alt={`QR ${c.codigo}`} className="coupon-qr-img" />
                      ) : (
                        <span className="coupon-qr-loading">Generando QR...</span>
                      )}
                    </div>
                  </div>

                  <div className="coupon-actions-inline mt-2">
                    <Button
                      variant="light"
                      size="sm"
                      className="coupon-copy-btn"
                      onClick={() => copiarCodigo(c.codigo)}
                      type="button"
                    >
                      <FaCopy className="me-2" />
                      {copiado === c.codigo ? "Copiado" : "Copiar código"}
                    </Button>

                    <Button
                      variant="danger"
                      size="sm"
                      className="coupon-pdf-btn"
                      onClick={() => void descargarCuponPDF(c)}
                      type="button"
                    >
                      <FaFilePdf className="me-2" />
                      Descargar PDF
                    </Button>
                  </div>

                  {/* Vence */}
                  <div className="expiry-footer mt-3">
                    <FaCalendarAlt className="me-2" />
                    <span>Disponible hasta {fmtDateOnly(c.fecha_limite_uso)}</span>
                  </div>

                  {/* Acciones al fondo */}
                  {/* <div className="mt-auto pt-3 d-flex gap-2">
                    <Button
                      className="btn-action-full"
                      variant="danger"
                      onClick={() => onDelete(c.id)}
                      disabled={deletingId === c.id}
                      type="button"
                    >
                      {deletingId === c.id ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Eliminando...
                        </>
                      ) : (
                        <>
                          <FaTrashAlt className="me-2" />
                          ELIMINAR CUPÓN
                        </>
                      )}
                    </Button>
                  </div> */}

                  <div className="coupon-footnote small mt-3">
                    <strong>ID interno:</strong> {c.id}
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

