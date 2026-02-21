import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Table, Modal, Form, Badge, Spinner, Alert } from 'react-bootstrap';
import { FaTrash, FaShoppingCart, FaArrowLeft, FaCreditCard, FaLock, FaTicketAlt, FaCheckCircle } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { comprarCupon } from '../services/api';
import "../styles/variables.css";

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotal, getCartCount } = useCart();
  const navigate = useNavigate();
  
  const [showCheckout, setShowCheckout] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [purchaseSuccess, setpurchaseSuccess] = useState(false);

  // Estado del formulario de tarjeta
  const [cardData, setCardData] = useState({
    numero: '',
    titular: '',
    expiracion: '',
    cvv: '',
  });

  const subtotal = getCartTotal();
  const comision = 0.00;
  const total = subtotal + comision;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCardData(prev => ({ ...prev, [name]: value }));
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validaciones básicas
      if (!cardData.numero || !cardData.titular || !cardData.expiracion || !cardData.cvv) {
        throw new Error('Por favor completa todos los campos de la tarjeta');
      }

      // Procesar cada item del carrito
      const compras = [];
      for (const item of cartItems) {
        const resultado = await comprarCupon({
          ofertaId: item.id,
          cantidad: item.cantidad,
          tarjeta: {
            numero: cardData.numero.replace(/\s/g, ''),
            titular: cardData.titular,
            expiracion: cardData.expiracion,
            cvv: cardData.cvv,
          },
        });
        compras.push(resultado);
      }

      setpurchaseSuccess(true);
      clearCart();
      
      // Mostrar mensaje de éxito
      setTimeout(() => {
        setShowCheckout(false);
        setpurchaseSuccess(false);
        navigate('/mis-cupones');
      }, 2000);

    } catch (err) {
      setError(err.message || 'Error al procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <Container className="py-5">
        <div className="d-flex align-items-center mb-4">
          <Link to="/" className="text-decoration-none me-3" style={{color: 'var(--color-text)'}}>
            <FaArrowLeft size={20} />
          </Link>
          <h2 className="fw-bold mb-0">Mi Carrito <FaShoppingCart className="ms-2" /></h2>
        </div>
        <Alert variant="info" className="text-center py-5">
          <FaShoppingCart size={50} className="mb-3 text-muted" />
          <h4>Tu carrito está vacío</h4>
          <p className="text-muted">Agrega cupones para comenzar tu compra</p>
          <Button as={Link} to="/coupons" variant="primary" className="mt-3">
            Ver Cupones Disponibles
          </Button>
        </Alert>
      </Container>
    );
  }

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
                    <th className="py-3 text-center">Cantidad</th>
                    <th className="py-3 text-end">Precio Unit.</th>
                    <th className="py-3 text-end">Subtotal</th>
                    <th className="py-3 text-center pe-4">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => (
                    <tr key={item.id} className="align-middle">
                      <td className="ps-4 py-3">
                        <div className="fw-bold">{item.titulo}</div>
                        <small className="text-muted">{item.descripcion}</small>
                      </td>
                      <td className="text-center">
                        <div className="d-flex align-items-center justify-content-center gap-2">
                          <Button 
                            variant="outline-secondary" 
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                          >
                            -
                          </Button>
                          <span className="fw-bold mx-2">{item.cantidad}</span>
                          <Button 
                            variant="outline-secondary" 
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                          >
                            +
                          </Button>
                        </div>
                      </td>
                      <td className="text-end">${Number(item.precio_oferta).toFixed(2)}</td>
                      <td className="text-end fw-bold">
                        ${(Number(item.precio_oferta) * item.cantidad).toFixed(2)}
                      </td>
                      <td className="text-center pe-4">
                        <Button 
                          variant="outline-danger" 
                          size="sm" 
                          className="border-0"
                          onClick={() => removeFromCart(item.id)}
                        >
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

        {/* RESUMEN DE COMPRA */}
        <Col lg={4}>
          <Card className="summary-card shadow-sm border-0">
            <Card.Body className="p-4">
              <h4 className="fw-bold mb-4">Resumen</h4>
              
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Subtotal ({getCartCount()} cupones)</span>
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
                disabled={loading}
              >
                <FaCreditCard className="me-2" />
                FINALIZAR COMPRA
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* MODAL DE PAGO */}
      <Modal show={showCheckout} onHide={() => !loading && setShowCheckout(false)} centered>
        <Modal.Header closeButton={!loading}>
          <Modal.Title className="fw-bold">Detalles de Pago</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {purchaseSuccess ? (
            <div className="text-center py-4">
              <FaCheckCircle size={60} className="text-success mb-3" />
              <h4 className="text-success mb-3">¡Compra Exitosa!</h4>
              <p className="text-muted">
                Recibirás un correo de confirmación con tus cupones.
              </p>
              <p className="text-muted">Redirigiendo a tus cupones...</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-4">
                <FaCreditCard size={40} color="var(--color-primary)" />
                <p className="mt-2 text-muted">
                  <FaLock className="me-1" /> Pago seguro encriptado
                </p>
              </div>

              {error && (
                <Alert variant="danger" className="mb-3">
                  {error}
                </Alert>
              )}

              <Form onSubmit={handlePayment}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre en la tarjeta</Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="Ej: Juan Pérez" 
                    name="titular"
                    value={cardData.titular}
                    onChange={handleInputChange}
                    required 
                    disabled={loading}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Número de tarjeta</Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="XXXX XXXX XXXX XXXX" 
                    name="numero"
                    value={cardData.numero}
                    onChange={handleInputChange}
                    maxLength="19"
                    required 
                    disabled={loading}
                  />
                  <Form.Text className="text-muted">
                    Mínimo 13 dígitos
                  </Form.Text>
                </Form.Group>

                <Row>
                  <Col xs={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Vencimiento</Form.Label>
                      <Form.Control 
                        type="text" 
                        placeholder="MM/YY" 
                        name="expiracion"
                        value={cardData.expiracion}
                        onChange={handleInputChange}
                        maxLength="5"
                        required 
                        disabled={loading}
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>CVV</Form.Label>
                      <Form.Control 
                        type="password" 
                        placeholder="123" 
                        name="cvv"
                        value={cardData.cvv}
                        onChange={handleInputChange}
                        maxLength="4"
                        required 
                        disabled={loading}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="alert alert-info small">
                  <strong>Total a pagar:</strong> ${total.toFixed(2)} por {getCartCount()} cupones
                </div>

                <Button 
                  type="submit" 
                  className="btn-signin w-100 mt-3 py-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <FaLock className="me-2" /> Pagar ${total.toFixed(2)}
                    </>
                  )}
                </Button>
              </Form>
            </>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default CartPage;