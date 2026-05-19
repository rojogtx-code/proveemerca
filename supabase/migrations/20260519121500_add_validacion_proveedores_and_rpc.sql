-- 1. Crear tipo ENUM si no existe para controlar el estado
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_formulario_enum') THEN
        CREATE TYPE public.estado_formulario_enum AS ENUM ('Pendiente', 'Completado');
    END IF;
END $$;

-- 2. Crear la tabla de control validacion_proveedores
CREATE TABLE IF NOT EXISTS public.validacion_proveedores (
    cedula TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    estado_formulario public.estado_formulario_enum NOT NULL DEFAULT 'Pendiente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Habilitar Seguridad de Nivel de Fila (RLS)
ALTER TABLE public.validacion_proveedores ENABLE ROW LEVEL SECURITY;

-- 4. Otorgar permisos explícitos según el estándar del proyecto
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.validacion_proveedores TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.validacion_proveedores TO authenticated;

-- 5. Crear trigger para actualización automática de updated_at
CREATE OR REPLACE TRIGGER update_validacion_proveedores_updated_at
    BEFORE UPDATE ON public.validacion_proveedores
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Crear la función RPC para registro transaccional completo
CREATE OR REPLACE FUNCTION public.registrar_proveedor_completo(
    p_cedula TEXT,
    p_nombre_proveedor TEXT,
    p_datos_proveedor JSONB,
    p_cuentas_bancarias JSONB
) RETURNS VOID AS $$
DECLARE
    v_proveedor_id INT8;
    v_cuenta RECORD;
BEGIN
    -- A. Insertar o actualizar el proveedor en la tabla proveedores
    INSERT INTO public.proveedores (
        cedula,
        nombre_proveedor,
        act_economica_principal,
        provincia,
        codigo_provincia,
        canton,
        codigo_canton,
        distrito,
        codigo_distrito,
        barrio,
        codigo_barrio,
        direccion_exacta,
        email_factura,
        tiene_actividad,
        tipo_cedula_nombre,
        tipo_cedula_id,
        cod_actividad_economica,
        es_proveedor,
        forma_pago,
        plazo_pago_dias,
        es_cliente,
        ventas_nombre,
        ventas_email,
        ventas_telefono,
        ventas_ext_telefono,
        ventas_whatsapp,
        ventas_ext_whatsapp,
        cobros_nombre,
        cobros_email,
        cobros_telefono,
        cobros_ext_telefono,
        cobros_whatsapp,
        cobros_ext_whatsapp,
        moneda_credito,
        monto_credito,
        es_compania,
        tiene_facturador,
        facturador_nombre,
        facturador_email,
        facturador_telefono,
        facturador_whatsapp,
        tiene_cobros,
        facturador_ext_telefono,
        facturador_ext_whatsapp,
        correo_comprobantes
    ) VALUES (
        p_cedula,
        p_nombre_proveedor,
        p_datos_proveedor->>'act_economica_principal',
        p_datos_proveedor->>'provincia',
        p_datos_proveedor->>'codigo_provincia',
        p_datos_proveedor->>'canton',
        p_datos_proveedor->>'codigo_canton',
        p_datos_proveedor->>'distrito',
        p_datos_proveedor->>'codigo_distrito',
        p_datos_proveedor->>'barrio',
        p_datos_proveedor->>'codigo_barrio',
        p_datos_proveedor->>'direccion_exacta',
        p_datos_proveedor->>'email_factura',
        (p_datos_proveedor->>'tiene_actividad')::INTEGER,
        p_datos_proveedor->>'tipo_cedula_nombre',
        p_datos_proveedor->>'tipo_cedula_id',
        p_datos_proveedor->>'cod_actividad_economica',
        COALESCE(p_datos_proveedor->>'es_proveedor', 'Si'),
        p_datos_proveedor->>'forma_pago',
        p_datos_proveedor->>'plazo_pago_dias',
        p_datos_proveedor->>'es_cliente',
        p_datos_proveedor->>'ventas_nombre',
        p_datos_proveedor->>'ventas_email',
        p_datos_proveedor->>'ventas_telefono',
        COALESCE(p_datos_proveedor->>'ventas_ext_telefono', '506'),
        p_datos_proveedor->>'ventas_whatsapp',
        COALESCE(p_datos_proveedor->>'ventas_ext_whatsapp', '506'),
        p_datos_proveedor->>'cobros_nombre',
        p_datos_proveedor->>'cobros_email',
        p_datos_proveedor->>'cobros_telefono',
        COALESCE(p_datos_proveedor->>'cobros_ext_telefono', '506'),
        p_datos_proveedor->>'cobros_whatsapp',
        COALESCE(p_datos_proveedor->>'cobros_ext_whatsapp', '506'),
        p_datos_proveedor->>'moneda_credito',
        p_datos_proveedor->>'monto_credito',
        p_datos_proveedor->>'es_compania',
        COALESCE((p_datos_proveedor->>'tiene_facturador')::BOOLEAN, false),
        p_datos_proveedor->>'facturador_nombre',
        p_datos_proveedor->>'facturador_email',
        p_datos_proveedor->>'facturador_telefono',
        p_datos_proveedor->>'facturador_whatsapp',
        COALESCE((p_datos_proveedor->>'tiene_cobros')::BOOLEAN, false),
        COALESCE(p_datos_proveedor->>'facturador_ext_telefono', '506'),
        COALESCE(p_datos_proveedor->>'facturador_ext_whatsapp', '506'),
        p_datos_proveedor->>'correo_comprobantes'
    )
    ON CONFLICT (cedula) 
    DO UPDATE SET 
        nombre_proveedor = EXCLUDED.nombre_proveedor,
        act_economica_principal = EXCLUDED.act_economica_principal,
        provincia = EXCLUDED.provincia,
        codigo_provincia = EXCLUDED.codigo_provincia,
        canton = EXCLUDED.canton,
        codigo_canton = EXCLUDED.codigo_canton,
        distrito = EXCLUDED.distrito,
        codigo_distrito = EXCLUDED.codigo_distrito,
        barrio = EXCLUDED.barrio,
        codigo_barrio = EXCLUDED.codigo_barrio,
        direccion_exacta = EXCLUDED.direccion_exacta,
        email_factura = EXCLUDED.email_factura,
        tiene_actividad = EXCLUDED.tiene_actividad,
        tipo_cedula_nombre = EXCLUDED.tipo_cedula_nombre,
        tipo_cedula_id = EXCLUDED.tipo_cedula_id,
        cod_actividad_economica = EXCLUDED.cod_actividad_economica,
        es_proveedor = EXCLUDED.es_proveedor,
        forma_pago = EXCLUDED.forma_pago,
        plazo_pago_dias = EXCLUDED.plazo_pago_dias,
        es_cliente = EXCLUDED.es_cliente,
        ventas_nombre = EXCLUDED.ventas_nombre,
        ventas_email = EXCLUDED.ventas_email,
        ventas_telefono = EXCLUDED.ventas_telefono,
        ventas_ext_telefono = EXCLUDED.ventas_ext_telefono,
        ventas_whatsapp = EXCLUDED.ventas_whatsapp,
        ventas_ext_whatsapp = EXCLUDED.ventas_ext_whatsapp,
        cobros_nombre = EXCLUDED.cobros_nombre,
        cobros_email = EXCLUDED.cobros_email,
        cobros_telefono = EXCLUDED.cobros_telefono,
        cobros_ext_telefono = EXCLUDED.cobros_ext_telefono,
        cobros_whatsapp = EXCLUDED.cobros_whatsapp,
        cobros_ext_whatsapp = EXCLUDED.cobros_ext_whatsapp,
        moneda_credito = EXCLUDED.moneda_credito,
        monto_credito = EXCLUDED.monto_credito,
        es_compania = EXCLUDED.es_compania,
        tiene_facturador = EXCLUDED.tiene_facturador,
        facturador_nombre = EXCLUDED.facturador_nombre,
        facturador_email = EXCLUDED.facturador_email,
        facturador_telefono = EXCLUDED.facturador_telefono,
        facturador_whatsapp = EXCLUDED.facturador_whatsapp,
        tiene_cobros = EXCLUDED.tiene_cobros,
        facturador_ext_telefono = EXCLUDED.facturador_ext_telefono,
        facturador_ext_whatsapp = EXCLUDED.facturador_ext_whatsapp,
        correo_comprobantes = EXCLUDED.correo_comprobantes
    RETURNING id INTO v_proveedor_id;

    -- B. Eliminar cuentas bancarias previas (si existen) e insertar las nuevas del formulario
    DELETE FROM public.cuentas_bancarias WHERE proveedor_id = v_proveedor_id;

    IF p_cuentas_bancarias IS NOT NULL AND jsonb_array_length(p_cuentas_bancarias) > 0 THEN
        FOR v_cuenta IN SELECT * FROM jsonb_to_recordset(p_cuentas_bancarias) AS x(
            banco_nombre TEXT,
            moneda TEXT,
            iban TEXT,
            cuenta_corriente TEXT,
            orden INT4
        ) LOOP
            INSERT INTO public.cuentas_bancarias (
                proveedor_id,
                banco_nombre,
                moneda,
                iban,
                cuenta_corriente,
                orden
            ) VALUES (
                v_proveedor_id,
                v_cuenta.banco_nombre,
                v_cuenta.moneda,
                v_cuenta.iban,
                v_cuenta.cuenta_corriente,
                v_cuenta.orden
            );
        END LOOP;
    END IF;

    -- C. Upsert de la tabla de control validacion_proveedores
    INSERT INTO public.validacion_proveedores (cedula, nombre, estado_formulario)
    VALUES (p_cedula, p_nombre_proveedor, 'Completado')
    ON CONFLICT (cedula) 
    DO UPDATE SET 
        nombre = EXCLUDED.nombre,
        estado_formulario = 'Completado',
        updated_at = timezone('utc'::text, now());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 7. Restringir la ejecución de la función a service_role por seguridad (bypass de RLS)
REVOKE EXECUTE ON FUNCTION public.registrar_proveedor_completo(TEXT, TEXT, JSONB, JSONB) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.registrar_proveedor_completo(TEXT, TEXT, JSONB, JSONB) TO service_role;
