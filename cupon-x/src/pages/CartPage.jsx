import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Table, Modal, Form, Badge } from 'react-bootstrap';
import { FaTrash, FaShoppingCart, FaArrowLeft, FaCreditCard, FaLock, FaTicketAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import "../styles/variables.css";

const CartPage = () => {
  const [showCheckout, setShowCheckout] = useState(false);

  // Datos de prueba
  const cartItems = [
    { id: 1, brand: "Pizza Hut", description: "2x1 en Pizzas Grandes", price: 15.99, code: "PIZZA2X1" },
    { id: 2, brand: "Adidas", description: "20% descuento en calzado", price: 5.00, code: "ADI20OFF" },
  ];

  const subtotal = cartItems.reduce((acc, item) => acc + item.price, 0);
  const comision = 0.00; // Puedes cambiarlo si luego cobras comisión
  const total = subtotal + comision;

  const handlePayment = (e) => {
    e.preventDefault();
    alert("¡Pago procesado con éxito!");
    setShowCheckout(false);
  };

  return (
    <Container className="py-5">
      <div className="d-flex align-items-center mb-4">
        <Link to="/" className="text-decoration-none me-3" style={{color: 'var(--color-text)'}}>
          <FaArrowLeft size={20} />
        </Link>
        <h2 className="fw-bold mb-0">Mi Carrito <FaShoppingCart className="ms-2" /></h2>
      </div>

      <Row>
        {/* TABLA DE PRODUCTOS */}
        <Col lg={8}>
          <Card className="shadow-sm border-0 mb-4">
            <Card.Body className="p-0">
              <Table responsive hover className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="ps-4 py-3">Cupón</th>
                    <th className="py-3 text-center">Código</th>
                    <th className="py-3 text-end">Precio</th>
                    <th className="py-3 text-center pe-4">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => (
                    <tr key={item.id} className="align-middle">
                      <td className="ps-4 py-3">
                        <div className="fw-bold">{item.brand}</div>
                        <small className="text-muted">{item.description}</small>
                      </td>
                      <td className="text-center">
                        {/* Aquí devolvemos el espacio del código */}
                        <Badge bg="light" text="dark" className="border px-3 py-2">
                          <FaTicketAlt className="me-2 text-secondary" />
                          {item.code}
                        </Badge>
                      </td>
                      <td className="text-end fw-bold">${item.price.toFixed(2)}</td>
                      <td className="text-center pe-4">
                        <Button variant="outline-danger" size="sm" className="border-0">
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        {/* RESUMEN DE COMPRA RESTAURADO */}
        <Col lg={4}>
          <Card className="summary-card shadow-sm border-0">
            <Card.Body className="p-4">
              <h4 className="fw-bold mb-4">Resumen</h4>
              
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Subtotal ({cartItems.length} cupones)</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              
              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">Comisión de plataforma</span>
                <span className="text-success fw-bold">GRATIS</span>
              </div>
              
              <hr />
              
              <div className="d-flex justify-content-between mb-4">
                <span className="h5 fw-bold">Total</span>
                <span className="h5 fw-bold" style={{color: 'var(--color-primary)'}}>
                  ${total.toFixed(2)}
                </span>
              </div>

              <Button 
                className="btn-signin w-100 py-3 fw-bold"
                onClick={() => setShowCheckout(true)}
              >
                FINALIZAR COMPRA
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* MODAL DE PAGO (Se mantiene igual) */}
      <Modal show={showCheckout} onHide={() => setShowCheckout(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">Detalles de Pago</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <div className="text-center mb-4">
            <FaCreditCard size={40} color="var(--color-primary)" />
            <p className="mt-2 text-muted">Pago seguro encriptado</p>
          </div>
          <Form onSubmit={handlePayment}>
             {/* ... campos de tarjeta ... */}
             <Form.Group className="mb-3">
              <Form.Label>Nombre en la tarjeta</Form.Label>
              <Form.Control type="text" placeholder="Ej: Juan Pérez" required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Número de tarjeta</Form.Label>
              <Form.Control type="text" placeholder="XXXX XXXX XXXX XXXX" required />
            </Form.Group>
            <Row>
              <Col xs={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Vencimiento</Form.Label>
                  <Form.Control type="text" placeholder="MM/YY" required />
                </Form.Group>
              </Col>
              <Col xs={6}>
                <Form.Group className="mb-3">
                  <Form.Label>CVV</Form.Label>
                  <Form.Control type="password" placeholder="123" required />
                </Form.Group>
              </Col>
            </Row>
            <Button type="submit" className="btn-signin w-100 mt-3 py-2">
              <FaLock className="me-2" /> Pagar ${total.toFixed(2)}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default CartPage;