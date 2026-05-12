import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { cedula } = await req.json();
    
    const { data, error } = await supabaseAdmin
      .from("proveedores")
      .select("cedula")
      .eq("cedula", cedula)
      .maybeSingle();

    if (error) throw error;
    
    return NextResponse.json({ existe: !!data });
  } catch (error) {
    console.error("Error en verificar-cedula:", error);
    return NextResponse.json({ existe: false });
  }
}