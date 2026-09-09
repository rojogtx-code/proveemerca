-- La RPC validar_admin es SECURITY DEFINER y consulta usuarios_admin con privilegios elevados.
-- No debe ser invocable directamente por anon/authenticated via PostgREST (/rest/v1/rpc/validar_admin);
-- solo el backend (service_role, usado en el servidor) debe poder ejecutarla.
--
-- Nota: el EXECUTE estaba otorgado a PUBLIC (el default al crear la función), del cual
-- anon/authenticated son miembros implícitos. Hay que revocar de PUBLIC directamente,
-- revocar solo de anon/authenticated no es suficiente.
REVOKE EXECUTE ON FUNCTION public.validar_admin(text, text) FROM PUBLIC;

-- Endurecer contra search_path hijacking (hallazgo del linter de seguridad de Supabase).
ALTER FUNCTION public.validar_admin(text, text) SET search_path = public;
