import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTopEmpresas } from "../services/api";
import StoreCard from "./StoreCard";

export default function TopStores() {
  const [stores, setStores] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await getTopEmpresas(6);
        const data = res.data || [];

        setStores(
          data.map((e) => ({
            id: e.id,
            name: e.nombre,
            description: e.descripcion_empresa || "Sin descripción",
                    // viene del join rubros
            reward: e.max_descuento_pct ?? 0,   // si el backend lo manda
            bgColor: e.color_hex || "#333333",  // 🔥 DB color
          }))
        );
      } catch (err) {
        setError(err.message);
      }
    })();
  }, []);

  return (
    <section style={{ padding: "24px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>
          Top <span style={{ color: "#d11" }}>Stores</span>
        </h2>

        <Link to="/stores" style={{ fontSize: 12, textDecoration: "none" }}>
          See All Stores
        </Link>
      </div>

      {error && <div style={{ marginTop: 12 }} className="alert alert-danger">{error}</div>}

      <div
        style={{
          marginTop: 14,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 14,
        }}
      >
        {stores.map((s) => (
          <StoreCard key={s.id} store={s} />
        ))}
      </div>
    </section>
  );
}