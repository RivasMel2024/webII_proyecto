-- Base de datos y configuración inicial
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

CREATE DATABASE IF NOT EXISTS `cuponx` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `cuponx`;

-- Cambiar delimitador para procedimientos y triggers
DELIMITER $$

-- Procedimientos almacenados
CREATE PROCEDURE `sp_actualizar_cupones_vencidos` ()
BEGIN
    UPDATE cupones c
    INNER JOIN ofertas o ON c.oferta_id = o.id
    SET c.estado = 'vencido'
    WHERE c.estado = 'disponible'
        AND CURDATE() > o.fecha_limite_uso;
END $$

CREATE PROCEDURE `sp_canjear_cupon` (
    IN `p_codigo_cupon` VARCHAR(13), 
    IN `p_dui_presentado` VARCHAR(10), 
    IN `p_empleado_id` INT, 
    OUT `p_valido` BOOLEAN, 
    OUT `p_mensaje` VARCHAR(255)
)
BEGIN
    DECLARE v_estado VARCHAR(20);
    DECLARE v_dui_cliente VARCHAR(10);
    DECLARE v_fecha_limite DATE;
    DECLARE v_cupon_id INT;

    SELECT c.id, c.estado, c.dui_cliente, o.fecha_limite_uso
    INTO v_cupon_id, v_estado, v_dui_cliente, v_fecha_limite
    FROM cupones c
    INNER JOIN ofertas o ON c.oferta_id = o.id
    WHERE c.codigo = p_codigo_cupon;

    IF v_cupon_id IS NULL THEN
        SET p_valido = FALSE;
        SET p_mensaje = 'El cupón no existe';
    ELSEIF v_estado = 'canjeado' THEN
        SET p_valido = FALSE;
        SET p_mensaje = 'El cupón ya fue canjeado';
    ELSEIF v_estado = 'vencido' THEN
        SET p_valido = FALSE;
        SET p_mensaje = 'El cupón está vencido';
    ELSEIF CURDATE() > v_fecha_limite THEN
        UPDATE cupones SET estado = 'vencido' WHERE id = v_cupon_id;
        SET p_valido = FALSE;
        SET p_mensaje = 'El cupón ha expirado';
    ELSEIF v_dui_cliente != p_dui_presentado THEN
        SET p_valido = FALSE;
        SET p_mensaje = 'El DUI no coincide con el comprador del cupón';
    ELSE
        UPDATE cupones 
        SET estado = 'canjeado',
            fecha_canje = CURRENT_TIMESTAMP,
            empleado_canje_id = p_empleado_id
        WHERE id = v_cupon_id;

        SET p_valido = TRUE;
        SET p_mensaje = 'Cupón canjeado exitosamente';
    END IF;
END $$

CREATE PROCEDURE `sp_generar_codigo_cupon` (IN `p_codigo_empresa` VARCHAR(6), OUT `p_codigo_cupon` VARCHAR(13))
BEGIN
    DECLARE v_codigo_generado VARCHAR(13);
    DECLARE v_existe INT;

    REPEAT
        SET v_codigo_generado = CONCAT(p_codigo_empresa, LPAD(FLOOR(RAND() * 10000000), 7, '0'));
        SELECT COUNT(*) INTO v_existe FROM cupones WHERE codigo = v_codigo_generado;
    UNTIL v_existe = 0
    END REPEAT;

    SET p_codigo_cupon = v_codigo_generado;
END $$

CREATE PROCEDURE `sp_comprar_cupon` (
    IN `p_oferta_id` INT, 
    IN `p_cliente_id` INT, 
    IN `p_precio_pagado` DECIMAL(10,2), 
    OUT `p_codigo_cupon` VARCHAR(13), 
    OUT `p_mensaje` VARCHAR(255)
)
BEGIN
    DECLARE v_codigo_empresa VARCHAR(6);
    DECLARE v_cantidad_limite INT;
    DECLARE v_cupones_vendidos INT;
    DECLARE v_fecha_inicio DATE;
    DECLARE v_fecha_fin DATE;
    DECLARE v_estado VARCHAR(20);
    DECLARE v_dui_cliente VARCHAR(10);

    SELECT e.codigo, o.cantidad_limite, o.fecha_inicio_oferta, o.fecha_fin_oferta, o.estado,
           (SELECT COUNT(*) FROM cupones WHERE oferta_id = o.id)
    INTO v_codigo_empresa, v_cantidad_limite, v_fecha_inicio, v_fecha_fin, v_estado, v_cupones_vendidos
    FROM ofertas o
    INNER JOIN empresas e ON o.empresa_id = e.id
    WHERE o.id = p_oferta_id;

    SELECT dui INTO v_dui_cliente FROM clientes WHERE id = p_cliente_id;

    IF v_estado != 'aprobada' THEN
        SET p_mensaje = 'La oferta no está aprobada';
        SET p_codigo_cupon = NULL;
    ELSEIF CURDATE() < v_fecha_inicio OR CURDATE() > v_fecha_fin THEN
        SET p_mensaje = 'La oferta no está vigente';
        SET p_codigo_cupon = NULL;
    ELSEIF v_cantidad_limite IS NOT NULL AND v_cupones_vendidos >= v_cantidad_limite THEN
        SET p_mensaje = 'La oferta ha agotado sus cupones disponibles';
        SET p_codigo_cupon = NULL;
    ELSE
        CALL sp_generar_codigo_cupon(v_codigo_empresa, p_codigo_cupon);
        INSERT INTO cupones (codigo, oferta_id, cliente_id, precio_pagado, dui_cliente)
        VALUES (p_codigo_cupon, p_oferta_id, p_cliente_id, p_precio_pagado, v_dui_cliente);
        SET p_mensaje = 'Cupón generado exitosamente';
    END IF;
END $$

-- Triggers
CREATE TRIGGER `trg_validar_dui_cliente` BEFORE INSERT ON `clientes`
FOR EACH ROW
BEGIN
    IF NEW.dui NOT REGEXP '^[0-9]{8}-[0-9]$' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El DUI debe tener formato: 12345678-9';
    END IF;
END $$

CREATE TRIGGER `trg_validar_codigo_empresa` BEFORE INSERT ON `empresas`
FOR EACH ROW
BEGIN
    IF NEW.codigo NOT REGEXP '^[A-Z]{3}[0-9]{3}$' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El código de empresa debe tener formato: 3 letras mayúsculas + 3 dígitos';
    END IF;
END $$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ofertas`
--

CREATE TABLE `ofertas` (
  `id` int(11) NOT NULL,
  `empresa_id` int(11) NOT NULL,
  `titulo` varchar(250) COLLATE utf8mb4_unicode_ci NOT NULL,
  `precio_regular` decimal(10,2) NOT NULL,
  `precio_oferta` decimal(10,2) NOT NULL,
  `fecha_inicio_oferta` date NOT NULL,
  `fecha_fin_oferta` date NOT NULL,
  `fecha_limite_uso` date NOT NULL,
  `cantidad_limite` int(11) DEFAULT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `otros_detalles` text COLLATE utf8mb4_unicode_ci,
  `imagen_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` enum('en_espera','aprobada','rechazada','descartada') COLLATE utf8mb4_unicode_ci DEFAULT 'en_espera',
  `razon_rechazo` text COLLATE utf8mb4_unicode_ci,
  `revisada_por` int(11) DEFAULT NULL,
  `fecha_revision` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rubros`
--

CREATE TABLE `rubros` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `rubros`
--

INSERT INTO `rubros` (`id`, `nombre`, `activo`, `created_at`, `updated_at`) VALUES
(1, 'Restaurantes', 1, '2026-02-09 19:55:33', '2026-02-09 19:55:33'),
(2, 'Entretenimiento', 1, '2026-02-09 19:55:33', '2026-02-09 19:55:33'),
(3, 'Salones de Belleza', 1, '2026-02-09 19:55:33', '2026-02-09 19:55:33'),
(4, 'Talleres', 1, '2026-02-09 19:55:33', '2026-02-09 19:55:33'),
(5, 'Gimnasios', 1, '2026-02-09 19:55:33', '2026-02-09 19:55:33'),
(6, 'Educación', 1, '2026-02-09 19:55:33', '2026-02-09 19:55:33'),
(7, 'Salud', 1, '2026-02-09 19:55:33', '2026-02-09 19:55:33'),
(8, 'Turismo', 1, '2026-02-09 19:55:33', '2026-02-09 19:55:33');

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `v_cupones_clientes`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `v_cupones_clientes` (
`id` int(11)
,`codigo` varchar(13)
,`estado` enum('disponible','canjeado','vencido')
,`precio_pagado` decimal(10,2)
,`fecha_compra` timestamp
,`fecha_canje` timestamp
,`cliente_id` int(11)
,`cliente_nombres` varchar(100)
,`cliente_apellidos` varchar(100)
,`cliente_dui` varchar(10)
,`oferta_titulo` varchar(250)
,`oferta_descripcion` text
,`fecha_limite_uso` date
,`empresa_nombre` varchar(200)
,`empresa_direccion` varchar(300)
,`empresa_telefono` varchar(20)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `v_estadisticas_ofertas`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `v_estadisticas_ofertas` (
`oferta_id` int(11)
,`titulo` varchar(250)
,`estado` enum('en_espera','aprobada','rechazada','descartada')
,`empresa_id` int(11)
,`empresa_nombre` varchar(200)
,`porcentaje_comision` decimal(5,2)
,`cupones_vendidos` bigint(21)
,`cupones_limite` int(11)
,`ingresos_totales` decimal(32,2)
,`cargo_comision` decimal(41,8)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `v_ofertas_activas`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `v_ofertas_activas` (
`id` int(11)
,`titulo` varchar(250)
,`precio_regular` decimal(10,2)
,`precio_oferta` decimal(10,2)
,`fecha_inicio_oferta` date
,`fecha_fin_oferta` date
,`fecha_limite_uso` date
,`cantidad_limite` int(11)
,`descripcion` text
,`otros_detalles` text
,`imagen_url` varchar(500)
,`empresa_nombre` varchar(200)
,`empresa_codigo` varchar(6)
,`rubro_nombre` varchar(100)
,`cupones_vendidos` bigint(21)
,`cupones_disponibles` bigint(22)
);

-- --------------------------------------------------------

--
-- Estructura para la vista `v_cupones_clientes`
--
DROP TABLE IF EXISTS `v_cupones_clientes`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_cupones_clientes`  AS  select `c`.`id` AS `id`,`c`.`codigo` AS `codigo`,`c`.`estado` AS `estado`,`c`.`precio_pagado` AS `precio_pagado`,`c`.`fecha_compra` AS `fecha_compra`,`c`.`fecha_canje` AS `fecha_canje`,`cl`.`id` AS `cliente_id`,`cl`.`nombres` AS `cliente_nombres`,`cl`.`apellidos` AS `cliente_apellidos`,`cl`.`dui` AS `cliente_dui`,`o`.`titulo` AS `oferta_titulo`,`o`.`descripcion` AS `oferta_descripcion`,`o`.`fecha_limite_uso` AS `fecha_limite_uso`,`e`.`nombre` AS `empresa_nombre`,`e`.`direccion` AS `empresa_direccion`,`e`.`telefono` AS `empresa_telefono` from (((`cupones` `c` join `clientes` `cl` on((`c`.`cliente_id` = `cl`.`id`))) join `ofertas` `o` on((`c`.`oferta_id` = `o`.`id`))) join `empresas` `e` on((`o`.`empresa_id` = `e`.`id`))) ;

-- --------------------------------------------------------

--
-- Estructura para la vista `v_estadisticas_ofertas`
--
DROP TABLE IF EXISTS `v_estadisticas_ofertas`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_estadisticas_ofertas`  AS  select `o`.`id` AS `oferta_id`,`o`.`titulo` AS `titulo`,`o`.`estado` AS `estado`,`e`.`id` AS `empresa_id`,`e`.`nombre` AS `empresa_nombre`,`e`.`porcentaje_comision` AS `porcentaje_comision`,count(`c`.`id`) AS `cupones_vendidos`,`o`.`cantidad_limite` AS `cupones_limite`,sum(`c`.`precio_pagado`) AS `ingresos_totales`,sum(((`c`.`precio_pagado` * `e`.`porcentaje_comision`) / 100)) AS `cargo_comision` from ((`ofertas` `o` join `empresas` `e` on((`o`.`empresa_id` = `e`.`id`))) left join `cupones` `c` on((`o`.`id` = `c`.`oferta_id`))) group by `o`.`id`,`o`.`titulo`,`o`.`estado`,`e`.`id`,`e`.`nombre`,`e`.`porcentaje_comision`,`o`.`cantidad_limite` ;

-- --------------------------------------------------------

--
-- Estructura para la vista `v_ofertas_activas`
--
DROP TABLE IF EXISTS `v_ofertas_activas`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_ofertas_activas`  AS  select `o`.`id` AS `id`,`o`.`titulo` AS `titulo`,`o`.`precio_regular` AS `precio_regular`,`o`.`precio_oferta` AS `precio_oferta`,`o`.`fecha_inicio_oferta` AS `fecha_inicio_oferta`,`o`.`fecha_fin_oferta` AS `fecha_fin_oferta`,`o`.`fecha_limite_uso` AS `fecha_limite_uso`,`o`.`cantidad_limite` AS `cantidad_limite`,`o`.`descripcion` AS `descripcion`,`o`.`otros_detalles` AS `otros_detalles`,`o`.`imagen_url` AS `imagen_url`,`e`.`nombre` AS `empresa_nombre`,`e`.`codigo` AS `empresa_codigo`,`r`.`nombre` AS `rubro_nombre`,(select count(0) from `cupones` where (`cupones`.`oferta_id` = `o`.`id`)) AS `cupones_vendidos`,(case when isnull(`o`.`cantidad_limite`) then NULL else (`o`.`cantidad_limite` - (select count(0) from `cupones` where (`cupones`.`oferta_id` = `o`.`id`))) end) AS `cupones_disponibles` from ((`ofertas` `o` join `empresas` `e` on((`o`.`empresa_id` = `e`.`id`))) join `rubros` `r` on((`e`.`rubro_id` = `r`.`id`))) where ((`o`.`estado` = 'aprobada') and (curdate() between `o`.`fecha_inicio_oferta` and `o`.`fecha_fin_oferta`) and (isnull(`o`.`cantidad_limite`) or ((select count(0) from `cupones` where (`cupones`.`oferta_id` = `o`.`id`)) < `o`.`cantidad_limite`))) ;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `administradores_cuponx`
--
ALTER TABLE `administradores_cuponx`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `correo` (`correo`);

--
-- Indices de la tabla `administradores_empresas`
--
ALTER TABLE `administradores_empresas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `correo` (`correo`),
  ADD KEY `idx_administradores_empresas_empresa` (`empresa_id`);

--
-- Indices de la tabla `clientes`
--
ALTER TABLE `clientes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `correo` (`correo`),
  ADD UNIQUE KEY `dui` (`dui`);

--
-- Indices de la tabla `cupones`
--
ALTER TABLE `cupones`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`),
  ADD KEY `empleado_canje_id` (`empleado_canje_id`),
  ADD KEY `idx_cupones_cliente` (`cliente_id`),
  ADD KEY `idx_cupones_oferta` (`oferta_id`),
  ADD KEY `idx_cupones_estado` (`estado`),
  ADD KEY `idx_cupones_codigo` (`codigo`);

--
-- Indices de la tabla `empresas`
--
ALTER TABLE `empresas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`),
  ADD UNIQUE KEY `correo` (`correo`),
  ADD KEY `idx_empresas_rubro` (`rubro_id`),
  ADD KEY `idx_empresas_correo` (`correo`);

--
-- Indices de la tabla `ofertas`
--
ALTER TABLE `ofertas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `revisada_por` (`revisada_por`),
  ADD KEY `idx_ofertas_empresa` (`empresa_id`),
  ADD KEY `idx_ofertas_estado` (`estado`),
  ADD KEY `idx_ofertas_fechas` (`fecha_inicio_oferta`,`fecha_fin_oferta`),
  ADD KEY `idx_ofertas_activas` (`estado`,`fecha_inicio_oferta`,`fecha_fin_oferta`);

--
-- Indices de la tabla `rubros`
--
ALTER TABLE `rubros`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `administradores_cuponx`
--
ALTER TABLE `administradores_cuponx`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `administradores_empresas`
--
ALTER TABLE `administradores_empresas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `clientes`
--
ALTER TABLE `clientes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `cupones`
--
ALTER TABLE `cupones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `empresas`
--
ALTER TABLE `empresas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `ofertas`
--
ALTER TABLE `ofertas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `rubros`
--
ALTER TABLE `rubros`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `administradores_empresas`
--
ALTER TABLE `administradores_empresas`
  ADD CONSTRAINT `administradores_empresas_ibfk_1` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `cupones`
--
ALTER TABLE `cupones`
  ADD CONSTRAINT `cupones_ibfk_1` FOREIGN KEY (`oferta_id`) REFERENCES `ofertas` (`id`),
  ADD CONSTRAINT `cupones_ibfk_2` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`),
  ADD CONSTRAINT `cupones_ibfk_3` FOREIGN KEY (`empleado_canje_id`) REFERENCES `administradores_empresas` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `empresas`
--
ALTER TABLE `empresas`
  ADD CONSTRAINT `empresas_ibfk_1` FOREIGN KEY (`rubro_id`) REFERENCES `rubros` (`id`);

--
-- Filtros para la tabla `ofertas`
--
ALTER TABLE `ofertas`
  ADD CONSTRAINT `ofertas_ibfk_1` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ofertas_ibfk_2` FOREIGN KEY (`revisada_por`) REFERENCES `administradores_cuponx` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
