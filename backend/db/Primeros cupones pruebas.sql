-- 1️⃣ Asegurarse de estar en la base correcta
USE cuponx;

-- 2️⃣ Verificar que exista empresa con código
SELECT id, nombre, codigo FROM empresas;

-- (Si alguna empresa no tiene código, ejemplo para la 1:)
-- UPDATE empresas SET codigo = 'RES001' WHERE id = 1;


-- 3️⃣ Crear oferta aprobada y vigente
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
 'Oferta de prueba para generar cupones',
 NULL,
 'aprobada');

-- 4️⃣ Ver el ID de la oferta creada
SELECT LAST_INSERT_ID() AS oferta_id_creada;

-- 5️⃣ Confirmar que la oferta está correcta
SELECT id, titulo, estado, empresa_id,
       fecha_inicio_oferta, fecha_fin_oferta
FROM ofertas
ORDER BY id DESC
LIMIT 1;


-- 6️⃣ Generar el cupón (CAMBIAR el 1 por el id real si es distinto)
SET @codigo := NULL;
SET @mensaje := NULL;

CALL sp_comprar_cupon(1, 1, 10.00, @codigo, @mensaje);

-- 7️⃣ Ver resultado del procedimiento
SELECT @codigo AS codigo_generado, @mensaje AS mensaje;

-- 8️⃣ Ver el cupón guardado
SELECT *
FROM cupones
WHERE cliente_id = 1
ORDER BY id DESC;

-- 9️⃣ Verificar vista (la que usa tu frontend)
SELECT *
FROM v_cupones_clientes
WHERE cliente_id = 1
ORDER BY fecha_compra DESC;
