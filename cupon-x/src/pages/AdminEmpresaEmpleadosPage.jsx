import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Table, Badge, Alert, Spinner, Button } from 'react-bootstrap';
import { FaArrowLeft, FaUsers } from 'react-icons/fa';
import { getEmpleadosByEmpresa, getAdminEmpresas } from '../services/api';
import '../styles/admindashboard.css';

const AdminEmpresaEmpleadosPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [empresa, setEmpresa] = useState(null);
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      setError('');
      try {
        const [resEmp, resEmpleados] = await Promise.all([
          getAdminEmpresas(),
          getEmpleadosByEmpresa(id),
        ]);
        if (resEmp.success) {
          const found = resEmp.data.find((e) => String(e.id) === String(id));
          setEmpresa(found || null);
        }
        if (resEmpleados.success) {
          setEmpleados(resEmpleados.data);
        }
      } catch (err) {
        setError('Error al cargar empleados');
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [id]);

  return (
    <Container className="admin-dashboard py-5">
      {/* HEADER */}
      <div className="admin-header mb-4">
        <div className="d-flex align-items-center gap-3 mb-1">
          <Button
            variant="link"
            className="p-0 text-decoration-none"
            style={{ color: '#555' }}
            onClick={() => navigate(-1)}
          >
            <FaArrowLeft size={18} />
          </Button>
          <h2 className="fw-bold mb-0">
            <FaUsers className="me-2" style={{ color: '#c1121f' }} />
            Empleados de {empresa ? empresa.nombre : `Empresa #${id}`}
          </h2>
        </div>
        <p className="text-muted mb-0 ms-4 ps-2">
          Listado de empleados registrados en esta empresa
        </p>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="admin-card shadow-sm border-0">
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" style={{ color: '#c1121f' }} />
            </div>
          ) : (
            <div className="table-container">
              <Table className="custom-table align-middle" responsive>
                <thead>
                  <tr>
                    <th>Nombres</th>
                    <th>Apellidos</th>
                    <th>Correo</th>
                    <th>Estado</th>
                    <th>Registrado</th>
                  </tr>
                </thead>
                <tbody>
                  {empleados.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-muted text-center py-4">
                        Esta empresa no tiene empleados registrados.
                      </td>
                    </tr>
                  ) : (
                    empleados.map((emp) => (
                      <tr key={emp.id}>
                        <td className="fw-semibold">{emp.nombres}</td>
                        <td>{emp.apellidos}</td>
                        <td>{emp.correo}</td>
                        <td>
                          <Badge bg={emp.activo ? 'success' : 'secondary'}>
                            {emp.activo ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </td>
                        <td>
                          {emp.created_at
                            ? new Date(emp.created_at).toLocaleDateString('es-SV')
                            : '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AdminEmpresaEmpleadosPage;
