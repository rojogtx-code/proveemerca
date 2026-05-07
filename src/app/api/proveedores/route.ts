import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { proveedorSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = proveedorSchema.parse(body);

    const payload = {
      cedula: data.cedula,
      nombre_proveedor: data.nombreProveedor,
      act_economica_principal: data.actEconomicaPrincipal,
      cod_actividad_economica: data.codActividadEconomica || null,
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
      email_contacto: data.emailContacto,
      nombre_contacto: data.nombreContacto,
      telefono: data.telefono,
      whatsapp: data.whatsapp,
    };

    if (body.actualizar) {
      const { error } = await supabase
        .from("proveedores")
        .upsert(payload, { onConflict: "cedula" });

      if (error) throw error;
      return NextResponse.json({ ok: true, accion: "actualizado" });
    }

    const { error } = await supabase.from("proveedores").insert(payload);

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
    const { data, error } = await supabase
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