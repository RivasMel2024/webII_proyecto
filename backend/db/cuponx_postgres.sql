-- ==========================================
-- SCRIPT DE MIGRACIÓN DE CUPONX A POSTGRESQL/SUPABASE
-- Convertido desde MySQL a PostgreSQL
-- ==========================================

-- ==========================================
-- 1. TIPOS ENUM
-- ==========================================

CREATE TYPE estado_oferta AS ENUM ('en_espera', 'aprobada', 'rechazada', 'descartada');
CREATE TYPE estado_cupon AS ENUM ('disponible', 'canjeado', 'vencido');

-- ==========================================
-- 2. TABLA: rubros
-- ==========================================

CREATE TABLE rubros (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Datos iniciales de rubros
INSERT INTO rubros (nombre, activo, created_at, updated_at) VALUES
('Restaurantes', TRUE, '2026-02-09 19:55:33', '2026-02-09 19:55:33'),
('Entretenimiento', TRUE, '2026-02-09 19:55:33', '2026-02-09 19:55:33'),
('Salones de Belleza', TRUE, '2026-02-09 19:55:33', '2026-02-09 19:55:33'),
('Talleres', TRUE, '2026-02-09 19:55:33', '2026-02-09 19:55:33'),
('Gimnasios', TRUE, '2026-02-09 19:55:33', '2026-02-09 19:55:33'),
('Educación', TRUE, '2026-02-09 19:55:33', '2026-02-09 19:55:33'),
('Salud', TRUE, '2026-02-09 19:55:33', '2026-02-09 19:55:33'),
('Turismo', TRUE, '2026-02-09 19:55:33', '2026-02-09 19:55:33'),
('Tecnología', TRUE, '2026-02-09 19:55:33', '2026-02-09 19:55:33'),
('Retail', TRUE, '2026-02-09 19:55:33', '2026-02-09 19:55:33'),
('Logística', TRUE, '2026-02-09 19:55:33', '2026-02-09 19:55:33'),
('Electrónica', TRUE, '2026-02-09 19:55:33', '2026-02-09 19:55:33'),
('Servicios', TRUE, '2026-02-09 19:55:33', '2026-02-09 19:55:33'),
('Social Media', TRUE, '2026-02-09 19:55:33', '2026-02-09 19:55:33');

-- ==========================================
-- 3. TABLA: empresas
-- ==========================================

CREATE TABLE empresas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    codigo VARCHAR(6) NOT NULL UNIQUE,
    direccion VARCHAR(300),
    nombre_contacto VARCHAR(150),
    telefono VARCHAR(20),
    correo VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rubro_id INTEGER NOT NULL,
    porcentaje_comision DECIMAL(5,2) DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    color_hex VARCHAR(7) DEFAULT '#333333',
    descripcion VARCHAR(150) DEFAULT '',
    reward_pct SMALLINT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT empresas_rubro_fk FOREIGN KEY (rubro_id) REFERENCES rubros(id),
    CONSTRAINT chk_codigo_empresa CHECK (codigo ~ '^[A-Z]{3}[0-9]{3}$')
);

CREATE INDEX idx_empresas_rubro ON empresas(rubro_id);
CREATE INDEX idx_empresas_correo ON empresas(correo);

-- Datos de ejemplo de empresas
INSERT INTO empresas 
(nombre, codigo, direccion, nombre_contacto, telefono, correo, password_hash, rubro_id, porcentaje_comision, activo, color_hex, descripcion, reward_pct)
VALUES
('Amazon', 'AMA001', 'Seattle, USA', 'Jeff Bezos', '1111-1111', 'contact@amazon.com', '$2a$10$example.hash', 9, 15, TRUE, '#232f3e', 'Compra online con millones de productos', 58),
('Canon', 'CAN001', 'Tokyo, Japan', 'Hiroshi Tanaka', '2222-2222', 'contact@canon.com', '$2a$10$example.hash', 12, 15, TRUE, '#ed1c24', 'Cámaras y tecnología de imagen profesional', 46),
('FedEx', 'FED001', 'Memphis, USA', 'John Smith', '3333-3333', 'contact@fedex.com', '$2a$10$example.hash', 11, 15, TRUE, '#4d148c', 'Envíos y logística internacional', 45),
('Microsoft', 'MIC001', 'Redmond, USA', 'Satya Nadella', '4444-4444', 'contact@microsoft.com', '$2a$10$example.hash', 9, 15, TRUE, '#00a4ef', 'Software, nube y soluciones empresariales', 45),
('Siemens', 'SIE001', 'Munich, Germany', 'Klaus Weber', '5555-5555', 'contact@siemens.com', '$2a$10$example.hash', 13, 15, TRUE, '#009999', 'Soluciones industriales y tecnológicas', 45),
('Meta', 'MET001', 'California, USA', 'Mark Zuckerberg', '6666-6666', 'contact@meta.com', '$2a$10$example.hash', 14, 15, TRUE, '#0668E1', 'Redes sociales y plataformas digitales', 45);

-- ==========================================
-- 4. TABLA: administradores_cuponx
-- ==========================================

CREATE TABLE administradores_cuponx (
    id SERIAL PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- 5. TABLA: administradores_empresas
-- ==========================================

CREATE TABLE administradores_empresas (
    id SERIAL PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    empresa_id INTEGER NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT administradores_empresas_empresa_fk FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE
);

CREATE INDEX idx_administradores_empresas_empresa ON administradores_empresas(empresa_id);

-- ==========================================
-- 6. TABLA: clientes
-- ==========================================

CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    dui VARCHAR(10) NOT NULL UNIQUE,
    correo VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    direccion VARCHAR(300),
    pais VARCHAR(100),
    fecha_nacimiento DATE,
    activo BOOLEAN DEFAULT TRUE,
    verificado BOOLEAN DEFAULT FALSE,
    token_verificacion VARCHAR(255),
    token_recuperacion VARCHAR(255),
    token_expiracion TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_dui_cliente CHECK (dui ~ '^[0-9]{8}-[0-9]$')
);

-- ==========================================
-- 7. TABLA: ofertas
-- ==========================================

CREATE TABLE ofertas (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER NOT NULL,
    titulo VARCHAR(250) NOT NULL,
    precio_regular DECIMAL(10,2) NOT NULL,
    precio_oferta DECIMAL(10,2) NOT NULL,
    fecha_inicio_oferta DATE NOT NULL,
    fecha_fin_oferta DATE NOT NULL,
    fecha_limite_uso DATE NOT NULL,
    cantidad_limite INTEGER,
    descripcion TEXT NOT NULL,
    otros_detalles TEXT,
    imagen_url VARCHAR(500),
    estado estado_oferta DEFAULT 'en_espera',
    razon_rechazo TEXT,
    revisada_por INTEGER,
    fecha_revision TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT ofertas_empresa_fk FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
    CONSTRAINT ofertas_revisada_fk FOREIGN KEY (revisada_por) REFERENCES administradores_cuponx(id) ON DELETE SET NULL
);

CREATE INDEX idx_ofertas_empresa ON ofertas(empresa_id);
CREATE INDEX idx_ofertas_estado ON ofertas(estado);
CREATE INDEX idx_ofertas_fechas ON ofertas(fecha_inicio_oferta, fecha_fin_oferta);
CREATE INDEX idx_ofertas_activas ON ofertas(estado, fecha_inicio_oferta, fecha_fin_oferta);

-- ==========================================
-- 8. TABLA: cupones
-- ==========================================

CREATE TABLE cupones (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(13) NOT NULL UNIQUE,
    oferta_id INTEGER NOT NULL,
    cliente_id INTEGER NOT NULL,
    dui_cliente VARCHAR(10) NOT NULL,
    precio_pagado DECIMAL(10,2) NOT NULL,
    estado estado_cupon DEFAULT 'disponible',
    fecha_compra TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_canje TIMESTAMPTZ,
    empleado_canje_id INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT cupones_oferta_fk FOREIGN KEY (oferta_id) REFERENCES ofertas(id),
    CONSTRAINT cupones_cliente_fk FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    CONSTRAINT cupones_empleado_fk FOREIGN KEY (empleado_canje_id) REFERENCES administradores_empresas(id) ON DELETE SET NULL
);

CREATE INDEX idx_cupones_cliente ON cupones(cliente_id);
CREATE INDEX idx_cupones_oferta ON cupones(oferta_id);
CREATE INDEX idx_cupones_estado ON cupones(estado);
CREATE INDEX idx_cupones_codigo ON cupones(codigo);
CREATE INDEX idx_cupones_empleado_canje ON cupones(empleado_canje_id);

-- ==========================================
-- 9. VISTAS
-- ==========================================

-- Vista: v_cupones_clientes
CREATE OR REPLACE VIEW v_cupones_clientes AS
SELECT 
    c.id,
    c.codigo,
    c.estado,
    c.precio_pagado,
    c.fecha_compra,
    c.fecha_canje,
    cl.id AS cliente_id,
    cl.nombres AS cliente_nombres,
    cl.apellidos AS cliente_apellidos,
    cl.dui AS cliente_dui,
    o.titulo AS oferta_titulo,
    o.descripcion AS oferta_descripcion,
    o.fecha_limite_uso,
    e.nombre AS empresa_nombre,
    e.direccion AS empresa_direccion,
    e.telefono AS empresa_telefono
FROM cupones c
INNER JOIN clientes cl ON c.cliente_id = cl.id
INNER JOIN ofertas o ON c.oferta_id = o.id
INNER JOIN empresas e ON o.empresa_id = e.id;

-- Vista: v_estadisticas_ofertas
CREATE OR REPLACE VIEW v_estadisticas_ofertas AS
SELECT 
    o.id AS oferta_id,
    o.titulo,
    o.estado,
    e.id AS empresa_id,
    e.nombre AS empresa_nombre,
    e.porcentaje_comision,
    COUNT(c.id) AS cupones_vendidos,
    o.cantidad_limite AS cupones_limite,
    SUM(c.precio_pagado) AS ingresos_totales,
    SUM((c.precio_pagado * e.porcentaje_comision) / 100) AS cargo_comision
FROM ofertas o
INNER JOIN empresas e ON o.empresa_id = e.id
LEFT JOIN cupones c ON o.id = c.oferta_id
GROUP BY o.id, o.titulo, o.estado, e.id, e.nombre, e.porcentaje_comision, o.cantidad_limite;

-- Vista: v_ofertas_activas
CREATE OR REPLACE VIEW v_ofertas_activas AS
SELECT 
    o.id,
    o.titulo,
    o.precio_regular,
    o.precio_oferta,
    o.fecha_inicio_oferta,
    o.fecha_fin_oferta,
    o.fecha_limite_uso,
    o.cantidad_limite,
    o.descripcion,
    o.otros_detalles,
    o.imagen_url,
    e.nombre AS empresa_nombre,
    e.codigo AS empresa_codigo,
    r.nombre AS rubro_nombre,
    (SELECT COUNT(*) FROM cupones WHERE oferta_id = o.id) AS cupones_vendidos,
    CASE 
        WHEN o.cantidad_limite IS NULL THEN NULL
        ELSE o.cantidad_limite - (SELECT COUNT(*) FROM cupones WHERE oferta_id = o.id)
    END AS cupones_disponibles
FROM ofertas o
INNER JOIN empresas e ON o.empresa_id = e.id
INNER JOIN rubros r ON e.rubro_id = r.id
WHERE o.estado = 'aprobada'
  AND CURRENT_DATE BETWEEN o.fecha_inicio_oferta AND o.fecha_fin_oferta
  AND (o.cantidad_limite IS NULL OR (SELECT COUNT(*) FROM cupones WHERE oferta_id = o.id) < o.cantidad_limite);

-- ==========================================
-- 10. FUNCIONES (PROCEDIMIENTOS ALMACENADOS)
-- ==========================================

-- Función: sp_actualizar_cupones_vencidos
CREATE OR REPLACE FUNCTION sp_actualizar_cupones_vencidos()
RETURNS VOID AS $function$
BEGIN
    UPDATE cupones c
    SET estado = 'vencido'
    FROM ofertas o
    WHERE c.oferta_id = o.id
      AND c.estado = 'disponible'
      AND CURRENT_DATE > o.fecha_limite_uso;
END;
$function$ LANGUAGE plpgsql;

-- Función: sp_generar_codigo_cupon
CREATE OR REPLACE FUNCTION sp_generar_codigo_cupon(p_codigo_empresa VARCHAR(6))
RETURNS VARCHAR(13) AS $function$
DECLARE
    v_codigo_generado VARCHAR(13);
    v_existe INTEGER;
BEGIN
    LOOP
        v_codigo_generado := p_codigo_empresa || LPAD(FLOOR(RANDOM() * 10000000)::TEXT, 7, '0');
        SELECT COUNT(*) INTO v_existe FROM cupones WHERE codigo = v_codigo_generado;
        EXIT WHEN v_existe = 0;
    END LOOP;
    
    RETURN v_codigo_generado;
END;
$function$ LANGUAGE plpgsql;

-- Función: sp_canjear_cupon
-- Nota: PostgreSQL no soporta parámetros OUT de la misma forma que MySQL.
-- Esta función retorna un JSON con valido y mensaje
CREATE OR REPLACE FUNCTION sp_canjear_cupon(
    p_codigo_cupon VARCHAR(13),
    p_dui_presentado VARCHAR(10),
    p_empleado_id INTEGER
)
RETURNS JSON AS $function$
DECLARE
    v_estado VARCHAR(20);
    v_dui_cliente VARCHAR(10);
    v_fecha_limite DATE;
    v_cupon_id INTEGER;
    v_resultado JSON;
BEGIN
    -- Obtener datos del cupón
    SELECT c.id, c.estado, c.dui_cliente, o.fecha_limite_uso
    INTO v_cupon_id, v_estado, v_dui_cliente, v_fecha_limite
    FROM cupones c
    INNER JOIN ofertas o ON c.oferta_id = o.id
    WHERE c.codigo = p_codigo_cupon;

    -- Validaciones
    IF v_cupon_id IS NULL THEN
        v_resultado := json_build_object('valido', FALSE, 'mensaje', 'El cupón no existe');
    ELSIF v_estado = 'canjeado' THEN
        v_resultado := json_build_object('valido', FALSE, 'mensaje', 'El cupón ya fue canjeado');
    ELSIF v_estado = 'vencido' THEN
        v_resultado := json_build_object('valido', FALSE, 'mensaje', 'El cupón está vencido');
    ELSIF CURRENT_DATE > v_fecha_limite THEN
        UPDATE cupones SET estado = 'vencido' WHERE id = v_cupon_id;
        v_resultado := json_build_object('valido', FALSE, 'mensaje', 'El cupón ha expirado');
    ELSIF v_dui_cliente != p_dui_presentado THEN
        v_resultado := json_build_object('valido', FALSE, 'mensaje', 'El DUI no coincide con el comprador del cupón');
    ELSE
        UPDATE cupones 
        SET estado = 'canjeado',
            fecha_canje = NOW(),
            empleado_canje_id = p_empleado_id
        WHERE id = v_cupon_id;
        
        v_resultado := json_build_object('valido', TRUE, 'mensaje', 'Cupón canjeado exitosamente');
    END IF;

    RETURN v_resultado;
END;
$function$ LANGUAGE plpgsql;

-- Función: sp_comprar_cupon
-- Retorna un JSON con codigo_cupon y mensaje
CREATE OR REPLACE FUNCTION sp_comprar_cupon(
    p_oferta_id INTEGER,
    p_cliente_id INTEGER,
    p_precio_pagado DECIMAL(10,2)
)
RETURNS JSON AS $function$
DECLARE
    v_codigo_empresa VARCHAR(6);
    v_cantidad_limite INTEGER;
    v_cupones_vendidos INTEGER;
    v_fecha_inicio DATE;
    v_fecha_fin DATE;
    v_estado VARCHAR(20);
    v_dui_cliente VARCHAR(10);
    v_codigo_cupon VARCHAR(13);
    v_resultado JSON;
BEGIN
    -- Obtener datos de la oferta y empresa
    SELECT e.codigo, o.cantidad_limite, o.fecha_inicio_oferta, o.fecha_fin_oferta, o.estado::TEXT,
           (SELECT COUNT(*) FROM cupones WHERE oferta_id = o.id)
    INTO v_codigo_empresa, v_cantidad_limite, v_fecha_inicio, v_fecha_fin, v_estado, v_cupones_vendidos
    FROM ofertas o
    INNER JOIN empresas e ON o.empresa_id = e.id
    WHERE o.id = p_oferta_id;

    -- Obtener DUI del cliente
    SELECT dui INTO v_dui_cliente FROM clientes WHERE id = p_cliente_id;

    -- Validaciones
    IF v_estado != 'aprobada' THEN
        v_resultado := json_build_object('codigo_cupon', NULL, 'mensaje', 'La oferta no está aprobada');
    ELSIF CURRENT_DATE < v_fecha_inicio OR CURRENT_DATE > v_fecha_fin THEN
        v_resultado := json_build_object('codigo_cupon', NULL, 'mensaje', 'La oferta no está vigente');
    ELSIF v_cantidad_limite IS NOT NULL AND v_cupones_vendidos >= v_cantidad_limite THEN
        v_resultado := json_build_object('codigo_cupon', NULL, 'mensaje', 'La oferta ha agotado sus cupones disponibles');
    ELSE
        -- Generar código único
        v_codigo_cupon := sp_generar_codigo_cupon(v_codigo_empresa);
        
        -- Insertar cupón
        INSERT INTO cupones (codigo, oferta_id, cliente_id, precio_pagado, dui_cliente)
        VALUES (v_codigo_cupon, p_oferta_id, p_cliente_id, p_precio_pagado, v_dui_cliente);
        
        v_resultado := json_build_object('codigo_cupon', v_codigo_cupon, 'mensaje', 'Cupón generado exitosamente');
    END IF;

    RETURN v_resultado;
END;
$function$ LANGUAGE plpgsql;

-- ==========================================
-- 11. TRIGGERS PARA UPDATED_AT
-- ==========================================

-- Función genérica para actualizar updated_at
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$ LANGUAGE plpgsql;

-- Aplicar trigger a todas las tablas
CREATE TRIGGER set_timestamp_rubros
    BEFORE UPDATE ON rubros
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_empresas
    BEFORE UPDATE ON empresas
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_administradores_cuponx
    BEFORE UPDATE ON administradores_cuponx
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_administradores_empresas
    BEFORE UPDATE ON administradores_empresas
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_clientes
    BEFORE UPDATE ON clientes
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_ofertas
    BEFORE UPDATE ON ofertas
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_cupones
    BEFORE UPDATE ON cupones
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

-- ==========================================
-- 12. POLÍTICAS RLS (ROW LEVEL SECURITY) - OPCIONAL
-- ==========================================
-- Descomentar si deseas activar RLS en Supabase

-- ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE cupones ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE ofertas ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;

-- Política ejemplo: Los clientes solo pueden ver sus propios cupones
-- CREATE POLICY "Clientes pueden ver sus propios cupones"
--     ON cupones FOR SELECT
--     USING (auth.uid()::text = cliente_id::text);

-- ==========================================
-- FIN DEL SCRIPT
-- ==========================================

-- NOTAS DE USO:
-- 1. Ejecuta este script completo en el SQL Editor de Supabase
-- 2. Las funciones retornan JSON en lugar de usar parámetros OUT
-- 3. Ejemplo de uso de sp_comprar_cupon:
--    SELECT sp_comprar_cupon(1, 1, 10.00);
-- 4. Ejemplo de uso de sp_canjear_cupon:
--    SELECT sp_canjear_cupon('ABC001123456', '12345678-9', 1);
-- 5. Para actualizar cupones vencidos:
--    SELECT sp_actualizar_cupones_vencidos();
