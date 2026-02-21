import React from 'react';
import VistaCupones from "../components/VistaCupones";

export default function CuponCliente() {
  return (
    <div className="container my-4">
      <h2 className="mb-4">Gestión de Cupones - Admin</h2>
      <VistaCupones />
    </div>
  );
}
