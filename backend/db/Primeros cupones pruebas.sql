-- ============================================================
-- SCRIPT DE DATOS DE PRUEBA - OFERTAS Y CUPONES
-- ============================================================
-- creamos ofertas para probar + el de chris
-- ============================================================

-- 1️⃣ Asegurarse de estar en la base correcta
USE cuponx;

-- 2️⃣ Verificar que exista empresa con código
SELECT '=== EMPRESAS DISPONIBLES ===' AS Info;
SELECT id, nombre, codigo, rubro_id FROM empresas;


-- 3️⃣ CREAR OFERTAS APROBADAS Y VIGENTES

-- OFERTA 1: RESTAURANTE - Hamburguesas (la primera ofert que creo chris)
INSERT INTO ofertas
(empresa_id, titulo, precio_regular, precio_oferta,
 fecha_inicio_oferta, fecha_fin_oferta, fecha_limite_uso,
 cantidad_limite, descripcion, otros_detalles, estado)
VALUES
(1, 'Promo Hamburguesa 2x1', 20.00, 10.00,
 CURDATE(),
 DATE_ADD(CURDATE(), INTERVAL 7 DAY),
 DATE_ADD(CURDATE(), INTERVAL 14 DAY),
 100,
 'Dos deliciosas hamburguesas de res con queso, lechuga, tomate y papas fritas. ¡No te lo pierdas!',
 'Válido para comer en el local o para llevar.',
 'aprobada');

-- OFERTA 2: RESTAURANTE - Cena Romántica
INSERT INTO ofertas
(empresa_id, titulo, precio_regular, precio_oferta,
 fecha_inicio_oferta, fecha_fin_oferta, fecha_limite_uso,
 cantidad_limite, descripcion, otros_detalles, estado)
VALUES
(1, 'Cena Romántica para 2 personas', 45.00, 29.99,
 CURDATE(),
 DATE_ADD(CURDATE(), INTERVAL 30 DAY),
 DATE_ADD(CURDATE(), INTERVAL 45 DAY),
 50,
 'Incluye: entrada, plato fuerte, postre y bebida para 2 personas. Ambiente romántico con música en vivo.',
 'Válido de lunes a jueves. Reservación previa.',
 'aprobada');

-- OFERTA 3: RESTAURANTE - Desayuno Típico (Sin límite)
INSERT INTO ofertas
(empresa_id, titulo, precio_regular, precio_oferta,
 fecha_inicio_oferta, fecha_fin_oferta, fecha_limite_uso,
 cantidad_limite, descripcion, otros_detalles, estado)
VALUES
(1, 'Desayuno Típico Salvadoreño', 12.00, 6.99,
 CURDATE(),
 DATE_ADD(CURDATE(), INTERVAL 15 DAY),
 DATE_ADD(CURDATE(), INTERVAL 25 DAY),
 NULL,
 'Desayuno completo con casamiento, huevos, plátano, crema, queso y café. ¡Sabor tradicional!',
 'Válido todos los días de 7am a 11am.',
 'aprobada');

-- OFERTA 4: ENTRETENIMIENTO - Cine + Combo
INSERT INTO ofertas
(empresa_id, titulo, precio_regular, precio_oferta,
 fecha_inicio_oferta, fecha_fin_oferta, fecha_limite_uso,
 cantidad_limite, descripcion, otros_detalles, estado)
VALUES
(2, 'Entrada de Cine + Combo de Palomitas', 15.00, 8.50,
 CURDATE(),
 DATE_ADD(CURDATE(), INTERVAL 20 DAY),
 DATE_ADD(CURDATE(), INTERVAL 30 DAY),
 100,
 'Incluye: 1 entrada a cualquier función + combo de palomitas medianas y refresco. Válido para todas las películas.',
 'No acumulable con otras promociones. Horarios sujetos a disponibilidad.',
 'aprobada');

-- OFERTA 5: ENTRETENIMIENTO - Matinée
INSERT INTO ofertas
(empresa_id, titulo, precio_regular, precio_oferta,
 fecha_inicio_oferta, fecha_fin_oferta, fecha_limite_uso,
 cantidad_limite, descripcion, otros_detalles, estado)
VALUES
(2, 'Matinée Especial - Películas Clásicas', 10.00, 5.00,
 DATE_SUB(CURDATE(), INTERVAL 5 DAY),
 DATE_ADD(CURDATE(), INTERVAL 5 DAY),
 DATE_ADD(CURDATE(), INTERVAL 10 DAY),
 40,
 'Proyecciones especiales de películas clásicas todos los domingos. Vive la magia del cine de antes.',
 'Solo funciones de domingo en horarios matutinos.',
 'aprobada');

-- OFERTA 6: SALONES DE BELLEZA - Spa Day
INSERT INTO ofertas
(empresa_id, titulo, precio_regular, precio_oferta,
 fecha_inicio_oferta, fecha_fin_oferta, fecha_limite_uso,
 cantidad_limite, descripcion, otros_detalles, estado)
VALUES
(3, 'Spa Day Completo - Relájate', 80.00, 45.00,
 CURDATE(),
 DATE_ADD(CURDATE(), INTERVAL 25 DAY),
 DATE_ADD(CURDATE(), INTERVAL 40 DAY),
 30,
 'Incluye: masaje relajante 60 min, facial hidratante, manicure y pedicure. Experimenta un día de relajación total.',
 'Reservación previa requerida. Disponible de martes a sábado.',
 'aprobada');

-- OFERTA 7: SALONES DE BELLEZA - Corte + Lavado
INSERT INTO ofertas
(empresa_id, titulo, precio_regular, precio_oferta,
 fecha_inicio_oferta, fecha_fin_oferta, fecha_limite_uso,
 cantidad_limite, descripcion, otros_detalles, estado)
VALUES
(3, 'Corte + Lavado + Secado - Unisex', 25.00, 12.50,
 CURDATE(),
 DATE_ADD(CURDATE(), INTERVAL 30 DAY),
 DATE_ADD(CURDATE(), INTERVAL 40 DAY),
 80,
 'Servicio completo de peluquería para hombres y mujeres. Incluye consulta de estilo personalizada.',
 'Aplica para todos los estilos de corte. Personal profesional.',
 'aprobada');

-- 4️⃣ Ver ofertas creadas
SELECT '=== OFERTAS CREADAS ===' AS Info;
SELECT id, titulo, empresa_id, precio_oferta, estado
FROM ofertas
WHERE estado = 'aprobada'
ORDER BY id DESC
LIMIT 10;

-- 5️⃣ GENERAR CUPÓN DE PRUEBA
-- Genera 1 cupón para el cliente 1 usando la primera oferta
SET @codigo := NULL;
SET @mensaje := NULL;

-- Obtener el ID de la primera oferta vigente
SET @primera_oferta := (
    SELECT id FROM ofertas 
    WHERE estado = 'aprobada' 
    ORDER BY id ASC 
    LIMIT 1
);

-- Generar cupón
CALL sp_comprar_cupon(@primera_oferta, 1, 10.00, @codigo, @mensaje);

-- 6️⃣ Ver resultado del procedimiento
SELECT '=== RESULTADO DE COMPRA DE CUPÓN ===' AS Info;
SELECT @codigo AS codigo_generado, @mensaje AS mensaje;

-- 7️⃣ Ver el cupón guardado
SELECT '=== CUPÓN CREADO ===' AS Info;
SELECT *
FROM cupones
WHERE cliente_id = 1
ORDER BY id DESC
LIMIT 1;

-- 8️⃣ Verificar vista (la que usa tu frontend)
SELECT '=== VISTA DE CUPONES DEL CLIENTE ===' AS Info;
SELECT *
FROM v_cupones_clientes
WHERE cliente_id = 1
ORDER BY fecha_compra DESC;

-- 9️⃣ RESUMEN FINAL - OFERTAS POR RUBRO
SELECT '=== OFERTAS CREADAS POR RUBRO ===' AS Info;
SELECT 
    r.nombre AS Rubro,
    COUNT(o.id) AS Total_Ofertas,
    GROUP_CONCAT(o.titulo SEPARATOR ' | ') AS Titulos
FROM ofertas o
INNER JOIN empresas e ON o.empresa_id = e.id
INNER JOIN rubros r ON e.rubro_id = r.id
WHERE o.estado = 'aprobada'
GROUP BY r.id, r.nombre
ORDER BY r.nombre;

SELECT '=== DETALLE DE TODAS LAS OFERTAS VIGENTES ===' AS Info;
SELECT 
    o.id,
    o.titulo,
    e.nombre AS Empresa,
    r.nombre AS Rubro,
    CONCAT('$', o.precio_regular) AS Precio_Regular,
    CONCAT('$', o.precio_oferta) AS Precio_Oferta,
    CONCAT(ROUND((1 - (o.precio_oferta / o.precio_regular)) * 100), '%') AS Descuento,
    o.cantidad_limite AS Limite_Cupones,
    DATE_FORMAT(o.fecha_fin_oferta, '%d/%m/%Y') AS Vence,
    CASE 
        WHEN CURDATE() BETWEEN o.fecha_inicio_oferta AND o.fecha_fin_oferta 
        THEN '✓ VIGENTE' 
        ELSE '✗ NO VIGENTE' 
    END AS Estado
FROM ofertas o
INNER JOIN empresas e ON o.empresa_id = e.id
INNER JOIN rubros r ON e.rubro_id = r.id
WHERE o.estado = 'aprobada'
ORDER BY r.nombre, o.titulo;
