import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1. Validar sesión en el servidor
    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session");

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // 2. Obtener los registros de la tabla de control validacion_proveedores
    // Ordenamos por fecha de actualización descendente para ver los más recientes primero
    const { data, error } = await supabaseAdmin
      .from("validacion_proveedores")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) throw error;
    
    return NextResponse.json({ rows: data });
  } catch (error) {
    console.error("Error en GET /api/validacion-proveedores:", error);
    return NextResponse.json(
      { error: "Error al obtener los datos de validación" },
      { status: 500 }
    );
  }
}
