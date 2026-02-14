import { useEffect, useMemo, useState } from "react";
import { getCuponesByCliente, deleteCupon } from "../services/api";

export default function CuponesCliente({ clienteId }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cupones, setCupones] = useState([]);
  const [copiado, setCopiado] = useState("");
  const [deletingId, setDeletingId] = useState(null);

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

    const run = async () => {
      if (!mounted) return;
      await loadCupones(clienteId);
    };

    run();
    return () => {
      mounted = false;
    };
  }, [clienteId]);

  const total = cupones.length;
  const isSingle = total === 1;

  const subtitle = useMemo(() => {
    if (!clienteId) return "Seleccioná un cliente para ver sus cupones";
    if (loading) return "Cargando información…";
    if (error) return "Hubo un problema al cargar";
    return `${total} cupón${total === 1 ? "" : "es"} encontrado${total === 1 ? "" : "s"}`;
  }, [clienteId, loading, error, total]);

  const badgeClass = (estado) => {
    const e = (estado || "").toLowerCase();
    if (e === "disponible") return "badge rounded-pill bg-success";
    if (e === "canjeado") return "badge rounded-pill bg-secondary";
    if (e === "vencido") return "badge rounded-pill bg-danger";
    return "badge rounded-pill bg-dark";
  };

  const fmtMoney = (n) => {
    const num = Number(n);
    if (Number.isNaN(num)) return "0.00";
    return num.toFixed(2);
  };

  const fmtDate = (d) => {
    if (!d) return "—";
    const date = new Date(d);
    if (Number.isNaN(date.getTime())) return String(d);
    return date.toLocaleString();
  };

  const copiarCodigo = async (codigo) => {
    try {
      await navigator.clipboard.writeText(codigo);
      setCopiado(codigo);
      setTimeout(() => setCopiado(""), 1200);
    } catch {
      setCopiado("");
    }
  };

  const onDelete = async (id) => {
    const ok = window.confirm(`¿Seguro que querés eliminar el cupón #${id}?`);
    if (!ok) return;

    try {
      setDeletingId(id);
      setError("");

      const res = await deleteCupon(id);
      if (!res?.success) throw new Error(res?.message || "No se pudo eliminar");

      // Quitar del estado sin recargar toda la página
      setCupones((prev) => prev.filter((c) => c.id !== id));
    } catch (e) {
      setError(e?.message || "Error eliminando el cupón");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="w-100">
      <div className="container-fluid px-4 my-4">
        {/* Este wrapper controla el ancho GENERAL del bloque */}
        <div
          className="w-100"
          style={{
            maxWidth: 1200,
            margin: "0 auto",
          }}
        >
          {/* Header */}
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mb-3">
            <div>
              <h3 className="m-0">Cupones del Cliente #{clienteId ?? "—"}</h3>
              <div className="text-muted small">{subtitle}</div>
            </div>

            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => loadCupones(clienteId)}
              disabled={loading}
              type="button"
            >
              Recargar
            </button>
          </div>

          {/* Estados */}
          {loading && <div className="alert alert-info">Cargando cupones...</div>}

          {error && (
            <div className="alert alert-danger">
              <strong>Error:</strong> {error}
            </div>
          )}

          {!loading && !error && total === 0 && (
            <div className="alert alert-warning">No hay cupones para este cliente.</div>
          )}

          {/* Cards */}
          {!loading && !error && total > 0 && (
            <div className="row g-4 justify-content-center">
              {cupones.map((c) => {
                // ✅ Aquí está el cambio clave:
                // si solo hay 1 cupón, la columna es más ancha
                const colClass = isSingle
                  ? "col-12 col-lg-8 col-xl-7"
                  : "col-12 col-md-10 col-lg-6";

                return (
                  <div className={colClass} key={`${c.id}-${c.codigo}`}>
                    <div
                      className="card shadow-sm rounded-4 border-0 overflow-hidden mx-auto"
                      style={{
                        width: "100%",
                        // ✅ más ancho cuando es solo 1
                        maxWidth: isSingle ? 760 : 9999,
                        // evita “palillo” por layouts raros
                        minWidth: 320,
                      }}
                    >
                      <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-start gap-3">
                          <div style={{ minWidth: 0 }}>
                            <h5
                              className="card-title mb-1"
                              style={{ overflowWrap: "anywhere" }}
                            >
                              {c.oferta_titulo || "Oferta"}
                            </h5>
                            <div className="text-muted small">Cupón #{c.id}</div>
                          </div>

                          <span className={badgeClass(c.estado)}>{c.estado || "N/A"}</span>
                        </div>

                        <p
                          className="text-muted mt-3 mb-3"
                          style={{ overflowWrap: "anywhere" }}
                        >
                          {c.oferta_descripcion || "Sin descripción"}
                        </p>

                        <ul className="list-group list-group-flush mb-3">
                          <li className="list-group-item px-0 d-flex align-items-center justify-content-between">
                            <span className="me-3">
                              <strong>Código:</strong>
                            </span>

                            <button
                              className="btn btn-light btn-sm border d-flex align-items-center gap-2"
                              onClick={() => copiarCodigo(c.codigo)}
                              type="button"
                              style={{ maxWidth: "100%" }}
                            >
                              <span
                                style={{
                                  fontFamily:
                                    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                                  overflowWrap: "anywhere",
                                }}
                              >
                                {c.codigo}
                              </span>
                              <span className="badge bg-primary-subtle text-primary-emphasis">
                                {copiado === c.codigo ? "Copiado" : "Copiar"}
                              </span>
                            </button>
                          </li>

                          <li className="list-group-item px-0 d-flex justify-content-between">
                            <span>
                              <strong>Precio pagado:</strong>
                            </span>
                            <span>${fmtMoney(c.precio_pagado)}</span>
                          </li>

                          <li className="list-group-item px-0 d-flex justify-content-between">
                            <span>
                              <strong>Comprado:</strong>
                            </span>
                            <span className="text-end">{fmtDate(c.fecha_compra)}</span>
                          </li>

                          <li className="list-group-item px-0 d-flex justify-content-between">
                            <span>
                              <strong>Vence:</strong>
                            </span>
                            <span className="text-end">{fmtDate(c.fecha_limite_uso)}</span>
                          </li>
                        </ul>

                        <div className="pt-3 border-top">
                          <div className="small text-muted">
                            <strong>Empresa:</strong> {c.empresa_nombre ?? "—"}
                          </div>
                          {c.empresa_direccion && (
                            <div className="small text-muted">{c.empresa_direccion}</div>
                          )}
                          {c.empresa_telefono && (
                            <div className="small text-muted">{c.empresa_telefono}</div>
                          )}
                        </div>

                        {/* Acciones */}
                        <div className="d-flex justify-content-end mt-3">
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => onDelete(c.id)}
                            disabled={deletingId === c.id}
                            type="button"
                          >
                            {deletingId === c.id ? "Eliminando..." : "Eliminar"}
                          </button>
                        </div>
                      </div>

                      <style>{`
                        .card:hover { transform: translateY(-2px); transition: 150ms ease; }
                      `}</style>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
