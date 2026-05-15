import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // Validar contra la función segura en Supabase (RPC)
    const { data: usuario, error: dbError } = await supabaseAdmin
      .rpc("validar_admin", {
        email_input: email,
        password_input: password
      });

    if (dbError) {
      console.error("Error en validación segura:", dbError.message);
    }

    // La función devuelve un array, tomamos el primer elemento si existe
    const userFound = Array.isArray(usuario) ? usuario[0] : usuario;

    if (userFound) {

      const cookieStore = await cookies();
      cookieStore.set("admin_session", "true", {
        path: "/",
        maxAge: 86400,
        sameSite: "lax",
        httpOnly: true, // Más seguro
        secure: process.env.NODE_ENV === "production",
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "Credenciales inválidas" },
      { status: 401 }
    );
  } catch (error) {
    console.error("Error en login API:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
