-- =====================================================
-- MIGRACIÓN: Agregar columnas faltantes a tabla clientes
-- =====================================================
-- Fecha: 2026-03-07
-- Propósito: Agregar columnas 'direccion' y 'pais' que faltaban
-- =====================================================

-- Agregar columna direccion
ALTER TABLE clientes 
ADD COLUMN IF NOT EXISTS direccion VARCHAR(300);

-- Agregar columna pais
ALTER TABLE clientes 
ADD COLUMN IF NOT EXISTS pais VARCHAR(100);

-- Verificar las columnas (opcional)
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'clientes'
ORDER BY ordinal_position;
