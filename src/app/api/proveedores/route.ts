import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { proveedorSchema } from "@/lib/validations";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = proveedorSchema.parse(body);

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
      email_factura: data.emailFactura,
      ventas_nombre: data.ventasNombre,
      ventas_email: data.ventasEmail,
      ventas_telefono: data.ventasTelefono,
      ventas_ext_telefono: data.ventasExtTelefono || "506",
      ventas_celular: data.ventasCelular,
      ventas_ext_celular: data.ventasExtCelular || "506",
      cobros_nombre: data.cobrosNombre,
      cobros_email: data.cobrosEmail,
      cobros_telefono: data.cobrosTelefono || null,
      cobros_ext_telefono: data.cobrosExtTelefono || "506",
      cobros_celular: data.cobrosCelular,
      cobros_ext_celular: data.cobrosExtCelular || "506",
      moneda_credito: data.monedaCredito || null,
      monto_credito: data.montoCredito || null,
      es_proveedor: "Si",
      es_compania: data.tipoCedulaId === "02" ? "Si" : (data.tipoCedulaId === "01" ? "No" : null),
    };

    if (body.actualizar) {
      const { error } = await supabaseAdmin
        .from("proveedores")
        .upsert(payload, { onConflict: "cedula" });

      if (error) throw error;
      return NextResponse.json({ ok: true, accion: "actualizado" });
    }

    const { error } = await supabaseAdmin.from("proveedores").insert(payload);

    if (error) {
      if (error.code === "23505") { // Unique violation
         return NextResponse.json({ error: "Ya existe un proveedor con esta cédula" }, { status: 400 });
      }
      throw error;
    }

    return NextResponse.json({ ok: true, accion: "creado" });
  } catch (error) {
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
      .select("*")
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