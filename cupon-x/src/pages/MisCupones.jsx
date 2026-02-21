import React from 'react';
import { getAuthUser } from '../services/api';
import CuponesCliente from '../components/CuponesCliente';

export default function MisCupones() {
  const user = getAuthUser();

  return (
    <div className="container my-4">
      <h2 className="mb-4">Mis Cupones</h2>
      {user?.id ? (
        <CuponesCliente clienteId={user.id} />
      ) : (
        <div className="alert alert-warning">
          No se pudo identificar tu usuario. Por favor, inicia sesión nuevamente.
        </div>
      )}
    </div>
  );
}
