import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session");
    const payload = verifySessionToken(session?.value);

    if (!payload) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const cedula = req.nextUrl.searchParams.get("cedula")?.trim() ?? "";
    if (!/^\d{9,12}$/.test(cedula)) {
      return NextResponse.json({ error: "Cédula inválida" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("proveedores")
      .select("*, cuentas_bancarias(*)")
      .eq("cedula", cedula)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: "No existe un proveedor registrado con esa cédula" }, { status: 404 });
    }

    return NextResponse.json({ proveedor: data });
  } catch (error) {
    console.error("Error en GET /api/proveedores/buscar:", error);
    return NextResponse.json({ error: "Error al buscar el proveedor" }, { status: 500 });
  }
}
