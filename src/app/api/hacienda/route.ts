import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const identificacion = searchParams.get("identificacion");

    if (!identificacion) {
      return NextResponse.json({ error: "Identificación requerida" }, { status: 400 });
    }

    const resHacienda = await fetch(
      `https://api.hacienda.go.cr/fe/ae?identificacion=${identificacion}`,
      {
        cache: "no-store",
        next: { revalidate: 0 },
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      }
    );

    const data = await resHacienda.json();
    
    // Mapear tipoIdentificacion a nombre legible
    const tipoMap: Record<string, string> = {
      "01": "Cédula Física",
      "02": "Cédula Jurídica",
      "03": "DIMEX",
      "04": "NITE",
    };
    const tipoCedulaId = data.tipoIdentificacion || "";
    const tipoCedulaNombre = tipoMap[tipoCedulaId] || "";

    // Si no hay actividades, lo indicamos explícitamente
    const actividades = data.actividades || [];
    
    return NextResponse.json({
      nombre: data.nombre,
      actividades: actividades,
      tieneActividad: actividades.length > 0,
      tipoCedulaId,
      tipoCedulaNombre,
    });
  } catch (error) {
    console.error("Error en GET /api/hacienda:", error);
    // Si falla, asumimos que no se encontró o no tiene actividad
    return NextResponse.json(
      { error: "No encontrado o sin actividad", actividades: [], tieneActividad: false },
      { status: 200 } // Retornamos 200 para que el frontend maneje la lógica
    );
  }
}
