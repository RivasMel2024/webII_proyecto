import React from 'react';
import { Container, Tabs, Tab, Card } from 'react-bootstrap';

import EstadisticasPanel from './EstadisticasPanel'; 
import GestionEmpresas from './GestionEmpresas'; 
import GestionOfertas from './GestionOfertas'; 
import CuponCliente from './CuponCliente';
import GestionRubros from './GestionRubros'; 
import '../styles/admindashboard.css';

const AdminDashboard = () => {
  return (
    <Container className="admin-dashboard py-5">
      
      {/* HEADER */}
      <div className="admin-header mb-4">
        <h2 className="fw-bold mb-1">Panel de Administración</h2>
        <p className="text-muted mb-0">
          Gestiona el rendimiento, socios y aprobación de ofertas de CuponX.
        </p>
      </div>

      {/* CARD PRINCIPAL */}
      <Card className="admin-card shadow-sm border-0">
        <Card.Body>

          <Tabs 
            defaultActiveKey="stats" 
            id="admin-tabs" 
            className="mb-4 custom-tabs"
            justify
          >
            <Tab eventKey="stats" title="Estadísticas">
              <div className="tab-content-box">
                <EstadisticasPanel />
              </div>
            </Tab>

            <Tab eventKey="empresas" title="Empresas">
              <div className="tab-content-box">
                <GestionEmpresas />
              </div>
            </Tab>

            <Tab eventKey="ofertas" title="Ofertas">
              <div className="tab-content-box">
                <GestionOfertas />
              </div>
            </Tab>

            <Tab eventKey="cupones" title="Cupones">
              <div className="tab-content-box">
                <CuponCliente />
              </div>
            </Tab>

            <Tab eventKey="rubros" title="Rubros">
              <div className="tab-content-box">
                <GestionRubros />
              </div>
            </Tab>
          </Tabs>

        </Card.Body>
      </Card>

    </Container>
  );
};

export default AdminDashboard;