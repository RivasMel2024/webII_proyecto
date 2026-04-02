import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { getOfertaById } from "../services/api";
import "../styles/ofertadetail.css";

export default function OfertaDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [oferta, setOferta] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const res = await getOfertaById(id);
        const data = res?.data || res;

        setOferta(data);
      } catch (err) {
        console.error("Error cargando oferta:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  if (loading) {
    return <div className="text-center mt-10">Cargando oferta...</div>;
  }

  if (!oferta) {
    return <div className="text-center text-red-500">No se encontró la oferta</div>;
  }

  const ahorro =
    (oferta.precio_regular || 0) - (oferta.precio_oferta || 0);

  return (
    <div className="oferta-container">

      {/* 🔙 BOTÓN VOLVER */}
      <button 
        className="btn-back"
        onClick={() => navigate(-1)}
      >
        <FaArrowLeft /> Volver
      </button>

      {/* 🧾 CARD PRINCIPAL */}
      <div className="oferta-card">

        <div className="oferta-image-wrapper">
          <img
            src={oferta.imagen_url || "https://placehold.co/800x400"}
            alt={oferta.titulo}
          />
          {oferta.precio_regular && (
            <div className="oferta-badge">
              -{Math.round((ahorro / oferta.precio_regular) * 100)}%
            </div>
          )}
        </div>

        <div className="oferta-content">
          <h1 className="oferta-title">{oferta.titulo}</h1>

          <div className="oferta-pricing">
            <span className="precio-oferta">
              ${oferta.precio_oferta}
            </span>

            <span className="precio-regular">
              ${oferta.precio_regular}
            </span>

            <span className="ahorro">
              Ahorras ${ahorro}
            </span>
          </div>

          <p className="oferta-description">
            {oferta.descripcion}
          </p>

          {/* 📅 FECHAS */}
          <div className="oferta-fechas">
            {oferta.fecha_fin_oferta && (
              <p>📅 Disponible hasta: {new Date(oferta.fecha_fin_oferta).toLocaleDateString()}</p>
            )}
            {oferta.fecha_limite_uso && (
              <p>⏳ Usar antes de: {new Date(oferta.fecha_limite_uso).toLocaleDateString()}</p>
            )}
          </div>

          {/* 📜 CONDICIONES (AHORA DENTRO) */}
          <div className="oferta-condiciones-inline">
            <h4>Condiciones</h4>
            <p>{oferta.otros_detalles || "Sin condiciones adicionales"}</p>
          </div>

        </div>
      </div>

      {/* 🏢 EMPRESA (SEPARADO) */}
      <div className="empresa-card">
        <h3>{oferta.empresa_nombre}</h3>
        <p className="empresa-desc">{oferta.empresa_descripcion}</p>

        <div className="empresa-info">
          <p>📍 {oferta.direccion}</p>
          <p>📞 {oferta.telefono}</p>
        </div>
      </div>

    </div>
  );
}