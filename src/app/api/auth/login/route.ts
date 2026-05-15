import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // Obtener usuarios permitidos desde variables de entorno
    let USUARIOS_PERMITIDOS: { email: string; pass: string }[] = [];

    const adminUsersEnv = process.env.ADMIN_USERS;
    if (adminUsersEnv && adminUsersEnv.trim() !== "") {
      try {
        USUARIOS_PERMITIDOS = JSON.parse(adminUsersEnv);
      } catch (e) {
        console.error("Error parseando ADMIN_USERS env:", e);
      }
    }

    // Si no hay usuarios en env, usar los de respaldo (fallback)
    if (USUARIOS_PERMITIDOS.length === 0) {
      USUARIOS_PERMITIDOS = [
        { email: "admin@mercasa.cr", pass: "Mercasa2024" },
        { email: "mercadeo@mercasa.cr", pass: "Mercasa2024" }
      ];
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
