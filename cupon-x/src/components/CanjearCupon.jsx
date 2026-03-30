import React, { useMemo, useState } from 'react';
import { Alert, Button, Card, Col, Form, Row } from 'react-bootstrap';
import '../styles/canjearcupon.css';

const DUI_REGEX = /^\d{8}-\d$/;
const CODIGO_REGEX = /^[A-Za-z0-9-]{4,30}$/;

const formatDui = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 9);
  if (digits.length <= 8) return digits;
  return `${digits.slice(0, 8)}-${digits.slice(8)}`;
};

export default function CanjearCupon() {
  const [codigo, setCodigo] = useState('');
  const [dui, setDui] = useState('');
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const isFormReady = useMemo(() => {
    return CODIGO_REGEX.test(codigo.trim()) && DUI_REGEX.test(dui);
  }, [codigo, dui]);

  const validate = () => {
    const nextErrors = {};
    const trimmedCodigo = codigo.trim();

    if (!trimmedCodigo) {
      nextErrors.codigo = 'El codigo del cupon es obligatorio.';
    } else if (!CODIGO_REGEX.test(trimmedCodigo)) {
      nextErrors.codigo = 'Usa entre 4 y 30 caracteres (letras, numeros o guion).';
    }

    if (!dui) {
      nextErrors.dui = 'El DUI es obligatorio.';
    } else if (!DUI_REGEX.test(dui)) {
      nextErrors.dui = 'Formato invalido. Debe ser 12345678-9.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(false);

    if (!validate()) return;

    // UI only: se muestra feedback visual de canje exitoso sin invocar backend.
    setSubmitted(true);
  };

  const handleReset = () => {
    setCodigo('');
    setDui('');
    setErrors({});
    setSubmitted(false);
  };

  return (
    <Card className="canje-card shadow-sm border-0">
      <Card.Body className="p-4 p-md-5">
        <div className="canje-header mb-4">
          <h2 className="canje-title">Canje de Cupon</h2>
          <p className="canje-subtitle mb-0">
            Ingresa el codigo del cupon y el DUI del cliente para validar el canje.
          </p>
        </div>

        {submitted && (
          <Alert variant="success" className="mb-4 canje-alert-success">
            Canje registrado en UI para el cupon <strong>{codigo.trim()}</strong> del DUI <strong>{dui}</strong>.
          </Alert>
        )}

        <Form noValidate onSubmit={handleSubmit}>
          <Row className="g-3">
            <Col md={7}>
              <Form.Group controlId="codigoCupon">
                <Form.Label className="canje-label">Codigo de cupon</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ej. CUPON-2026-001"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                  isInvalid={!!errors.codigo}
                  className="canje-input"
                  autoComplete="off"
                  maxLength={30}
                />
                <Form.Control.Feedback type="invalid">{errors.codigo}</Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={5}>
              <Form.Group controlId="duiCliente">
                <Form.Label className="canje-label">DUI cliente</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="12345678-9"
                  value={dui}
                  onChange={(e) => setDui(formatDui(e.target.value))}
                  isInvalid={!!errors.dui}
                  className="canje-input"
                  autoComplete="off"
                  inputMode="numeric"
                  maxLength={10}
                />
                <Form.Control.Feedback type="invalid">{errors.dui}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex gap-2 mt-4 flex-wrap">
            <Button type="submit" className="btn-canje-primary" disabled={!isFormReady}>
              Confirmar canje
            </Button>
            <Button type="button" variant="outline-secondary" onClick={handleReset} className="btn-canje-secondary">
              Limpiar
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}