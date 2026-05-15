import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // Obtener usuarios permitidos desde variables de entorno
    let USUARIOS_PERMITIDOS: { email: string; pass: string }[] = [];

    try {
      const adminUsersEnv = process.env.ADMIN_USERS;
      if (adminUsersEnv && adminUsersEnv.trim() !== "") {
        USUARIOS_PERMITIDOS = JSON.parse(adminUsersEnv);
      } else {
        console.error("ADVERTENCIA: Variable de entorno ADMIN_USERS no configurada. Acceso administrativo deshabilitado.");
      }
    } catch (e) {
      console.error("Error parseando ADMIN_USERS env:", e);
    }

    const usuario = USUARIOS_PERMITIDOS.find(
      (u: any) => u.email === email && u.pass === password
    );

    if (usuario) {
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
