import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { supabaseAdmin } from "@/lib/supabase";
import { proveedorSchema } from "@/lib/validations";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // `actualizar` es metadata para el mensaje de respuesta; no forma parte del schema
    const { actualizar, ...rest } = body ?? {};
    const data = proveedorSchema.parse(rest);

    const payload = {
      cedula: data.cedula,
      nombre_proveedor: data.nombreProveedor,
      act_economica_principal: data.actEconomicaPrincipal || null,
      cod_actividad_economica: data.codActividadEconomica || null,
      tiene_actividad: data.tieneActividad ? 1 : 0,
      forma_pago: data.plazoPagoDias === "0" ? "Contado" : "Crédito",
      plazo_pago_dias: `${data.plazoPagoDias} días`,
      es_cliente: data.esCliente,
      tipo_cedula_id: data.tipoCedulaId,
      tipo_cedula_nombre: data.tipoCedulaNombre,
      provincia: data.provincia,
      codigo_provincia: data.codigoProvincia,
      canton: data.canton,
      codigo_canton: data.codigoCanton,
      distrito: data.distrito,
      codigo_distrito: data.codigoDistrito,
      barrio: data.barrio,
      codigo_barrio: data.codigoBarrio,
      direccion_exacta: data.direccionExacta,
      // Normalizar a null cuando el campo está vacío (esCliente="No" o no aplica).
      // Evita CHECK constraints / triggers de validación de email sobre cadenas vacías.
      email_factura: data.esCliente === "Si" ? (data.emailFactura || null) : null,
      ventas_nombre: data.ventasNombre,
      ventas_email: data.ventasEmail,
      ventas_telefono: data.ventasTelefono,
      ventas_ext_telefono: "506",
      ventas_whatsapp: data.ventasWhatsApp || null,
      ventas_ext_whatsapp: "506",
      tiene_facturador: data.tieneFacturador,
      facturador_nombre: data.tieneFacturador ? (data.facturadorNombre || null) : null,
      facturador_email: data.tieneFacturador ? (data.facturadorEmail || null) : null,
      facturador_telefono: data.tieneFacturador ? (data.facturadorTelefono || null) : null,
      facturador_ext_telefono: "506",
      facturador_whatsapp: data.tieneFacturador ? (data.facturadorWhatsApp || null) : null,
      facturador_ext_whatsapp: "506",
      tiene_cobros: data.tieneCobros,
      cobros_nombre: data.tieneCobros ? (data.cobrosNombre || null) : null,
      cobros_email: data.tieneCobros ? (data.cobrosEmail || null) : null,
      cobros_telefono: data.tieneCobros ? (data.cobrosTelefono || null) : null,
      cobros_ext_telefono: "506",
      cobros_whatsapp: data.tieneCobros ? (data.cobrosWhatsApp || null) : null,
      cobros_ext_whatsapp: "506",
      moneda_credito: data.monedaCredito || null,
      monto_credito: data.montoCredito || null,
      correo_comprobantes: data.correoComprobantes,
      es_proveedor: "Si",
      es_compania: data.tipoCedulaId === "02" ? "Si" : (data.tipoCedulaId === "01" ? "No" : null),
    };

    // 2. Preparar las cuentas bancarias para el payload JSONB del RPC
    const cuentasParaInsertar = data.cuentas ? data.cuentas.map((c, index) => ({
      banco_nombre: c.banco === "Otros" ? c.otroBanco : c.banco,
      moneda: c.moneda,
      iban: `CR${c.iban}`, // Guardamos el IBAN completo
      cuenta_corriente: c.cuentaCorriente || null,
      orden: index + 1
    })) : [];

    // 3. Ejecutar el registro completo a través de la función RPC transaccional
    const { error: rpcError } = await supabaseAdmin.rpc("registrar_proveedor_completo", {
      p_cedula: data.cedula,
      p_nombre_proveedor: data.nombreProveedor,
      p_datos_proveedor: payload,
      p_cuentas_bancarias: cuentasParaInsertar
    });

    if (rpcError) {
      console.error("Error RPC registrar_proveedor_completo:", {
        code: rpcError.code,
        message: rpcError.message,
        details: rpcError.details,
        hint: rpcError.hint,
      });
      if (rpcError.code === "23505") { // Unique violation
        return NextResponse.json({ error: "Ya existe un proveedor con esta cédula" }, { status: 400 });
      }
      return NextResponse.json(
        { error: `Error al guardar los datos: ${rpcError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, accion: actualizar ? "actualizado" : "creado" });
  } catch (error) {
    if (error instanceof ZodError) {
      console.error("Validación Zod fallida en POST /api/proveedores:", error.issues);
      const firstIssue = error.issues[0];
      const campo = firstIssue?.path?.join(".") || "datos";
      return NextResponse.json(
        { error: `Datos inválidos en "${campo}": ${firstIssue?.message ?? "valor incorrecto"}` },
        { status: 400 }
      );
    }
    console.error("Error en POST /api/proveedores:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al guardar los datos" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Validar sesión en el servidor
    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session");

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Usar supabaseAdmin para bypass de RLS (ya que cerramos lectura pública)
    const { data, error } = await supabaseAdmin
      .from("proveedores")
      .select("*, cuentas_bancarias(*)")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ rows: data });
  } catch (error) {
    console.error("Error en GET /api/proveedores:", error);
    return NextResponse.json(
      { error: "Error al obtener los datos" },
      { status: 500 }
    );
  }
}