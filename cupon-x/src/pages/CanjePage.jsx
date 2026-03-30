import React from 'react';
import CanjearCupon from '../components/CanjearCupon';
import '../styles/canjearcupon.css';

export default function CanjePage() {
  return (
    <div className="container my-4 canje-page">
      <h1 className="canje-page-title">Modulo de Canje de Cupones</h1>
      <p className="canje-page-text">
        Vista para empleado/admin cuponera. Este modulo es de interfaz y validacion local.
      </p>

      <CanjearCupon />
    </div>
  );
}