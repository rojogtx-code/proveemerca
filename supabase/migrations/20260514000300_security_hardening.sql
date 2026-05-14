-- 1. Corregir el search_path de la función de trigger para mayor seguridad
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;

-- 2. Eliminar las políticas de RLS demasiado permisivas para el rol anónimo
-- Ahora que la API utiliza supabaseAdmin, no necesitamos permitir acceso directo desde la clave anónima.
DROP POLICY IF EXISTS "Permitir inserciones públicas" ON public.proveedores;
DROP POLICY IF EXISTS "Permitir actualizaciones públicas" ON public.proveedores;

-- 3. Asegurar que RLS esté activado
ALTER TABLE public.proveedores ENABLE ROW LEVEL SECURITY;
