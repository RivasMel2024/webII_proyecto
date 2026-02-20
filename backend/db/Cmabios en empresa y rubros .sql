/* ============================================
   1️⃣ AGREGAR COLUMNAS NUEVAS
============================================ */

ALTER TABLE empresas
ADD COLUMN color_hex VARCHAR(7) DEFAULT '#333333';

ALTER TABLE empresas
ADD COLUMN descripcion VARCHAR(150) NOT NULL DEFAULT '';

ALTER TABLE empresas
ADD COLUMN reward_pct TINYINT UNSIGNED NOT NULL DEFAULT 0;


/* ============================================
   2️⃣ CREAR RUBROS (SI NO EXISTEN)
============================================ */

INSERT INTO rubros (nombre) VALUES
('Tecnología'),
('Retail'),
('Logística'),
('Electrónica'),
('Servicios'),
('Social Media');


/* ============================================
   3️⃣ INSERTAR EMPRESAS
============================================ */

INSERT INTO empresas
(nombre, codigo, direccion, nombre_contacto, telefono, correo, password_hash, rubro_id, porcentaje_comision, activo, created_at, updated_at, color_hex)
VALUES
('Amazon', 'AMA001', 'Seattle, USA', 'Jeff Bezos', '1111-1111', 'contact@amazon.com', '$2a$10$example.hash', 13, 15, 1, NOW(), NOW(), '#232f3e'),

('Canon', 'CAN001', 'Tokyo, Japan', 'Hiroshi Tanaka', '2222-2222', 'contact@canon.com', '$2a$10$example.hash', 15, 15, 1, NOW(), NOW(), '#ed1c24'),

('FedEx', 'FED001', 'Memphis, USA', 'John Smith', '3333-3333', 'contact@fedex.com', '$2a$10$example.hash', 14, 15, 1, NOW(), NOW(), '#4d148c'),

('Microsoft', 'MIC001', 'Redmond, USA', 'Satya Nadella', '4444-4444', 'contact@microsoft.com', '$2a$10$example.hash', 12, 15, 1, NOW(), NOW(), '#00a4ef'),

('Siemens', 'SIE001', 'Munich, Germany', 'Klaus Weber', '5555-5555', 'contact@siemens.com', '$2a$10$example.hash', 16, 15, 1, NOW(), NOW(), '#009999'),

('Meta', 'MET001', 'California, USA', 'Mark Zuckerberg', '6666-6666', 'contact@meta.com', '$2a$10$example.hash', 17, 15, 1, NOW(), NOW(), '#0668E1');


/* ============================================
   4️⃣ ACTUALIZAR DESCRIPCIÓN Y REWARD
============================================ */

UPDATE empresas SET
descripcion = 'Compra online con millones de productos',
reward_pct = 58
WHERE codigo = 'AMA001';

UPDATE empresas SET
descripcion = 'Cámaras y tecnología de imagen profesional',
reward_pct = 46
WHERE codigo = 'CAN001';

UPDATE empresas SET
descripcion = 'Envíos y logística internacional',
reward_pct = 45
WHERE codigo = 'FED001';

UPDATE empresas SET
descripcion = 'Software, nube y soluciones empresariales',
reward_pct = 45
WHERE codigo = 'MIC001';

UPDATE empresas SET
descripcion = 'Soluciones industriales y tecnológicas',
reward_pct = 45
WHERE codigo = 'SIE001';

UPDATE empresas SET
descripcion = 'Redes sociales y plataformas digitales',
reward_pct = 45
WHERE codigo = 'MET001';


/* ============================================
   5️⃣ VERIFICAR RESULTADO
============================================ */

SELECT nombre, descripcion, reward_pct, color_hex
FROM empresas;