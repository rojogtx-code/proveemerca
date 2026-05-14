-- Otorgar permisos explícitos para la tabla proveedores según el nuevo estándar de Supabase
GRANT INSERT, UPDATE ON TABLE public.proveedores TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.proveedores TO authenticated;
GRANT ALL ON TABLE public.proveedores TO service_role;

-- Importante: Otorgar permisos sobre las secuencias para permitir la generación automática de IDs
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- Comentario para registro
COMMENT ON TABLE public.proveedores IS 'Informacion actualizada de proveedores con permisos explícitos para Data API';
