import React, { useEffect, useState } from 'react';
import { Table, Button, Form, Modal } from 'react-bootstrap';
import { getAdminOfertas, aprobarOfertaApi, rechazarOfertaApi } from '../services/api';

const GestionOfertas = () => {
  const [ofertas, setOfertas] = useState([]);
  const [filtro, setFiltro] = useState('en_espera'); 
  const [showModal, setShowModal] = useState(false);
  const [ofertaSeleccionada, setOfertaSeleccionada] = useState(null);
  const [razon, setRazon] = useState('');

  const cargarOfertas = async () => {
    const res = await getAdminOfertas(filtro);
    if (res.success) setOfertas(res.data);
  };

  useEffect(() => { cargarOfertas(); }, [filtro]);

  const handleAprobar = async (id) => {
    if(!window.confirm("¿Estás seguro de aprobar esta oferta?")) return;
    const res = await aprobarOfertaApi(id);
    if (res.success) {
      alert("Oferta aprobada con éxito");
      cargarOfertas();
    }
  };

  const handleRechazar = async () => {
    if (!razon) return alert("Debes poner una razón");
    
    const res = await rechazarOfertaApi(ofertaSeleccionada.id, razon);
    if (res.success) {
      setShowModal(false);
      setRazon('');
      setOfertaSeleccionada(null);
      cargarOfertas();
    }
  };

  return (
    <div className="gestion-ofertas">

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Revisión de Ofertas</h4>
          <small className="text-muted">Aprueba o rechaza ofertas enviadas por empresas</small>
        </div>

        <Form.Select 
          className="select-filtro"
          value={filtro} 
          onChange={(e) => setFiltro(e.target.value)}
        >
          <option value="en_espera">Pendientes</option>
          <option value="aprobada">Aprobadas</option>
          <option value="rechazada">Rechazadas</option>
          <option value="">Todas</option>
        </Form.Select>
      </div>

      {/* TABLA */}
      <div className="table-container">
        <Table className="custom-table align-middle" responsive>
          <thead>
            <tr>
              <th>Empresa</th>
              <th>Título</th>
              <th>Precio</th>
              <th>Estado</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ofertas.map(o => (
              <tr key={o.id}>
                <td className="fw-semibold">{o.empresa_nombre}</td>
                <td>{o.titulo}</td>
                <td>${o.precio_oferta}</td>

                {/* ESTADO SIN COLORES FUERTES */}
                <td>
                  <span className={`estado-badge estado-${o.estado}`}>
                    {o.estado.replace('_', ' ')}
                  </span>
                </td>

                <td className="text-center">
                  {o.estado === 'en_espera' && (
                    <div className="d-flex justify-content-center gap-2">
                      <Button 
                        size="sm" 
                        className="btn-aprobar"
                        onClick={() => handleAprobar(o.id)}
                      >
                        Aprobar
                      </Button>

                      <Button 
                        size="sm" 
                        className="btn-rechazar"
                        onClick={() => {
                          setOfertaSeleccionada(o);
                          setShowModal(true);
                        }}
                      >
                        Rechazar
                      </Button>
                    </div>
                  )}

                  {o.estado === 'rechazada' && (
                    <div className="razon-rechazo">
                      <small>{o.razon_rechazo}</small>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* MODAL */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">Rechazar Oferta</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p className="mb-2">
            Motivo del rechazo para:
          </p>
          <strong>{ofertaSeleccionada?.empresa_nombre}</strong>

          <Form.Control 
            as="textarea" 
            rows={3} 
            value={razon}
            className="input-custom mt-3"
            placeholder="Ej: El precio no es competitivo..." 
            onChange={(e) => setRazon(e.target.value)}
          />
        </Modal.Body>

        <Modal.Footer>
          <Button 
            className="btn-empresa-secondary"
            onClick={() => setShowModal(false)}
          >
            Cancelar
          </Button>
          <Button 
            className="btn-rechazar"
            onClick={handleRechazar}
          >
            Confirmar Rechazo
          </Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
};

export default GestionOfertas;