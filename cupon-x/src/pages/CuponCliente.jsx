import React from 'react';
import VistaCupones from "../components/VistaCupones";

export default function CuponCliente() {
  return (
    <div className="container my-4">
      <h4 className="fw-bold mb-1">Gestión de cupones</h4>
      <VistaCupones />
    </div>
  );
}
