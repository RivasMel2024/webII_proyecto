import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getOfertaById,
  getEmpresaById,
  getCuponById
} from "../services/api";

export default function CuponDetailPage() {
  const { id } = useParams();

  const [cupon, setCupon] = useState(null);
  const [oferta, setOferta] = useState(null);
  const [empresa, setEmpresa] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        console.log("ID recibido:", id); 

        // 1. CUPÓN
        const cuponRes = await getCuponById(id);
        const cuponData = cuponRes?.data || cuponRes;

        setCupon(cuponData);

        // 2. OFERTA
        const ofertaRes = await getOfertaById(cuponData.oferta_id);
        const ofertaData = ofertaRes?.data || ofertaRes;

        setOferta(ofertaData);

        // 3. EMPRESA
        const empresaRes = await getEmpresaById(ofertaData.empresa_id);
        const empresaData = empresaRes?.data || empresaRes;

        setEmpresa(empresaData);

      } catch (err) {
        console.error("Error cargando cupón:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Cargando cupón...
      </div>
    );
  }

  if (!cupon || !oferta || !empresa) {
    return (
      <div className="text-center text-red-500 mt-10">
        No se pudo cargar el cupón
      </div>
    );
  }

  const ahorro =
    (oferta.precio_regular || 0) - (oferta.precio_oferta || 0);

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">

      {/* HEADER CUPÓN */}
      <div
        className="bg-white shadow-md rounded-2xl p-5 border-l-8"
        style={{ borderColor: empresa.color_hex || "#ddd" }}
      >
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold tracking-wide">
              CUPÓN #{cupon.codigo}
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Comprado el{" "}
              {cupon.fecha_compra
                ? new Date(cupon.fecha_compra).toLocaleString()
                : "—"}
            </p>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              cupon.estado === "canjeado"
                ? "bg-gray-200 text-gray-600"
                : "bg-green-100 text-green-700"
            }`}
          >
            {cupon.estado}
          </span>
        </div>
      </div>

      {/* OFERTA CON IMAGEN */}
      <div className="bg-white shadow-md rounded-2xl overflow-hidden">
        {/* Contenedor de la imagen */}
        <div className="w-full h-80 bg-gray-100 flex items-center justify-center overflow-hidden">
          <img
            src={oferta.imagen_url || "https://via.placeholder.com/800x400?text=Cupón+Sin+Imagen"}
            alt={oferta.titulo}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/800x400?text=Error+al+cargar+imagen";
            }}
          />
        </div>

        <div className="p-5 space-y-3">
          <h2 className="text-xl font-bold">{oferta.titulo}</h2>

          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-green-600">
              ${Number(oferta.precio_oferta).toFixed(2)}
            </span>

            <span className="line-through text-gray-400">
              ${Number(oferta.precio_regular).toFixed(2)}
            </span>

            <span className="text-sm text-blue-600 font-medium">
              Ahorras ${ahorro.toFixed(2)}
            </span>
          </div>

          <p className="text-gray-600 leading-relaxed">{oferta.descripcion}</p>
        </div>
      </div>

      {/* DETALLES OFERTA */}
      <div className="bg-white shadow-md rounded-2xl p-5 space-y-2">
        <h3 className="font-semibold text-lg border-b pb-2">Detalles de la oferta</h3>

        <p className="text-gray-600 pt-2">{oferta.otros_detalles || "No hay condiciones adicionales."}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mt-4 bg-gray-50 p-3 rounded-lg">
          <p>
            <strong>Inicio:</strong>{" "}
            {oferta.fecha_inicio_oferta
              ? new Date(oferta.fecha_inicio_oferta).toLocaleDateString()
              : "—"}
          </p>

          <p>
            <strong>Fin:</strong>{" "}
            {oferta.fecha_fin_oferta
              ? new Date(oferta.fecha_fin_oferta).toLocaleDateString()
              : "—"}
          </p>

          <p>
            <strong>Límite uso:</strong>{" "}
            {oferta.fecha_limite_uso
              ? new Date(oferta.fecha_limite_uso).toLocaleDateString()
              : "—"}
          </p>

          <p><strong>Cupos disponibles:</strong> {oferta.cantidad_limite || "Sin límite"}</p>
        </div>
      </div>

      {/* EMPRESA */}
      <div
        className="bg-white shadow-md rounded-2xl p-5 border-l-4"
        style={{ borderColor: empresa.color_hex || "#ddd" }}
      >
        <div className="flex justify-between items-center mb-2">
           <h3 className="font-semibold text-lg">{empresa.nombre}</h3>
           <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">Cod: {empresa.codigo}</span>
        </div>

        <p className="text-gray-600 italic text-sm">"{empresa.descripcion}"</p>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
          <p>{empresa.direccion}</p>
          <p>{empresa.telefono}</p>
          <p>{empresa.correo}</p>
        </div>
      </div>

      {/* CUPÓN PERSONAL */}
      <div className="bg-blue-50 border border-blue-100 shadow-inner rounded-2xl p-5 space-y-2">
        <h3 className="font-semibold text-lg text-blue-900">Tu información de compra</h3>

        <div className="flex justify-between items-center text-sm text-gray-700">
          <p className="font-medium text-lg">💰 Pagado: ${Number(cupon.precio_pagado).toFixed(2)}</p>

          <p className="bg-white px-3 py-1 rounded-lg border border-blue-200">
            {cupon.fecha_canje
              ? `Canjeado el ${new Date(
                  cupon.fecha_canje
                ).toLocaleString()}`
              : "Aún no canjeado"}
          </p>
        </div>

        <div className="pt-2 border-t border-blue-200 flex justify-between items-center">
          <p className="text-xs text-gray-500 uppercase tracking-widest">
            DUI: {cupon.dui_cliente}
          </p>
          <p className="text-xs text-gray-400">ID Cupón: {cupon.id}</p>
        </div>
      </div>
    </div>
  );
}