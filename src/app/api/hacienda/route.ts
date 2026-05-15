import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const identificacion = searchParams.get("identificacion");

    if (!identificacion) {
      return NextResponse.json({ error: "Identificación requerida" }, { status: 400 });
    }

    // Validación previa según documentación: entre 9 y 12 dígitos, numérico.
    if (!/^\d{9,12}$/.test(identificacion)) {
      return NextResponse.json({ error: "El formato de identificación es inválido" }, { status: 400 });
    }

    let resHacienda = await fetch(
      `https://api.hacienda.go.cr/fe/ae?identificacion=${identificacion}`,
      {
        // Se implementa caché por 24 horas para evitar consultas excesivas según recomendaciones
        next: { revalidate: 86400 },
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      }
    );

    // Manejo del límite de consumo superado (429) con un reintento simple
    if (resHacienda.status === 429) {
      console.warn("Límite de peticiones a Hacienda excedido (429). Esperando 1.5s antes de reintentar...");
      await new Promise((resolve) => setTimeout(resolve, 1500));
      resHacienda = await fetch(
        `https://api.hacienda.go.cr/fe/ae?identificacion=${identificacion}`,
        {
          next: { revalidate: 86400 },
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          },
        }
      );
    }

    // Errores diferenciados según el código de respuesta de Hacienda
    if (!resHacienda.ok) {
      if (resHacienda.status === 400) {
        return NextResponse.json(
          { error: "Formato de cédula inválido, por favor revisar y volver a intentar" },
          { status: 200 }
        );
      }
      if (resHacienda.status === 404) {
        return NextResponse.json(
          { error: "Cédula no existe en Hacienda, por favor revisar y volver a intentar" },
          { status: 200 }
        );
      }
      if (resHacienda.status === 429) {
        return NextResponse.json(
          { error: "En este momento no es posible conectar con la base de datos de Hacienda, por favor esperar unos minutos y volver a intentar" },
          { status: 200 }
        );
      }
      throw new Error(`Hacienda API error: ${resHacienda.status} ${resHacienda.statusText}`);
    }

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
    return NextResponse.json(
      { error: "En este momento no es posible conectar con la base de datos de Hacienda, por favor esperar unos minutos y volver a intentar" },
      { status: 200 }
    );
  }
}
