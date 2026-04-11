import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/notfound.css';

const NotFound = () => {
  const location = useLocation();

  return (
    <section className="notfound">
      <div className="notfound-card">
        <p className="notfound-code">404</p>
        <h1 className="notfound-title">Pagina no encontrada</h1>
        <p className="notfound-text">
          No existe una vista para <span className="notfound-path">{location.pathname}</span>.
        </p>
        <div className="notfound-actions">
          <Link to="/" className="notfound-link">Volver al inicio</Link>
        </div>
      </div>
    </section>
  );
};

export default NotFound;
