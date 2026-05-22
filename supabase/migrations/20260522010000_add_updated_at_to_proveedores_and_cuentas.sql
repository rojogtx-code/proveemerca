-- =========================================================================
-- Fix: trigger "update_updated_at_column" falla al actualizar proveedores
-- =========================================================================
-- Causa raiz
-- ----------
-- La funcion de trigger public.update_updated_at_column() (definida en una
-- migracion historica anterior a este repo) asigna NEW.updated_at = now()
-- y retorna NEW. Cuando se aplica como trigger BEFORE UPDATE sobre una
-- tabla que NO tiene columna updated_at, PL/pgSQL lanza:
--
--     record "new" has no field "updated_at"
--
-- Esto se reproduce en la ruta ON CONFLICT (cedula) DO UPDATE del RPC
-- registrar_proveedor_completo. Por eso los INSERT (cedulas nuevas) sí
-- funcionaban y los UPDATE (cedulas existentes) fallaban.
--
-- Solucion
-- --------
-- 1. Agregar la columna updated_at a public.proveedores y a
--    public.cuentas_bancarias (la API recrea cuentas en cada actualizacion;
--    el trigger podria estar atado a ambas tablas).
-- 2. Asegurar que ambas tablas tengan el trigger BEFORE UPDATE que invoca
--    public.update_updated_at_column(). Si el trigger ya existe se
--    reemplaza con CREATE OR REPLACE TRIGGER (Postgres 14+).
--
-- Idempotente: usa IF NOT EXISTS en columnas y CREATE OR REPLACE en trigger.

-- 1. Columna updated_at en proveedores
ALTER TABLE public.proveedores
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE
    NOT NULL DEFAULT timezone('utc'::text, now());

-- 2. Columna updated_at en cuentas_bancarias
ALTER TABLE public.cuentas_bancarias
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE
    NOT NULL DEFAULT timezone('utc'::text, now());

-- 3. Trigger BEFORE UPDATE en proveedores (idempotente)
CREATE OR REPLACE TRIGGER update_proveedores_updated_at
    BEFORE UPDATE ON public.proveedores
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Trigger BEFORE UPDATE en cuentas_bancarias (idempotente)
CREATE OR REPLACE TRIGGER update_cuentas_bancarias_updated_at
    BEFORE UPDATE ON public.cuentas_bancarias
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Notas
-- -----
-- - El RPC registrar_proveedor_completo no requiere cambios: ya hace upsert
--   transaccional del proveedor (ON CONFLICT DO UPDATE) y reemplazo total
--   de las cuentas bancarias (DELETE + INSERT del set entrante). Esto cubre
--   el caso "menos -> mas datos" y "mas -> menos datos" sin huerfanos:
--   el formulario representa el estado actualizado completo.
-- - Los contactos (facturador, cobros) son columnas planas en proveedores
--   y EXCLUDED.x los sobreescribe en cada UPDATE; la API ya envia NULL
--   cuando los toggles estan en false.
