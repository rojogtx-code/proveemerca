"use client";

import { useEffect, useState } from "react";
import Papa from "papaparse";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

type Fila = string[];

const HEADERS = [
  "Fecha Registro", "Cédula", "Nombre Proveedor", "CodActEconomica",
  "Provincia", "Cantón", "Distrito", "Barrio", "Dirección exacta",
  "Plazo de Pago", "¿Es cliente de Mercasa?", "Moneda del Crédito", "Monto de Crédito Autorizado",
  "Email Factura", "ventas_nombre", "ventas_email", "ventas_telefono", "ventas_celular",
  "cobros_nombre", "cobros_email", "cobros_telefono", "cobros_celular"
];

export default function AdminPage() {
  const [filas, setFilas] = useState<Fila[]>([]);
  // Estado para admin
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Error al cerrar sesión", err);
      // Fallback: intentar limpiar cookie y redirigir
      document.cookie = "admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      router.push("/login");
    }
  };


  useEffect(() => {
    fetch("/api/proveedores")
      .then((res) => res.json())
      .then((data) => {
        // Mapear objetos de Supabase a arreglos para mantener compatibilidad con la tabla
        const mappedRows = data.rows.map((p: any) => [
          new Date(p.created_at).toLocaleString("es-CR"),
          p.cedula,
          p.nombre_proveedor,
          p.cod_actividad_economica || "—",
          p.provincia,
          p.canton,
          p.distrito,
          p.barrio,
          p.direccion_exacta,
          p.plazo_pago_dias,
          p.es_cliente,
          p.moneda_credito || "—",
          p.monto_credito || "—",
          p.email_factura,
          p.ventas_nombre,
          p.ventas_email,
          p.ventas_telefono,
          p.ventas_celular,
          p.cobros_nombre,
          p.cobros_email,
          p.cobros_telefono,
          p.cobros_celular,
        ]);
        setFilas(mappedRows);
      })
      .finally(() => setCargando(false));
  }, []);

  function descargarCSV() {
    const csv = Papa.unparse({ fields: HEADERS, data: filas });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `proveedores-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const filasFiltradas = filas.filter((fila) =>
    fila.some((celda) =>
      celda?.toLowerCase().includes(busqueda.toLowerCase())
    )
  );

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="relative w-40 h-16">
              <Image
                src="/logo.png"
                alt="Logo Mercasa"
                fill
                className="object-contain object-left"
                priority
              />
            </div>
            <div className="border-l border-slate-200 pl-4 h-10 flex flex-col justify-center">
              <h1 className="text-2xl font-bold text-slate-800 leading-none">
                Panel Administrativo
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                {filas.length} proveedor{filas.length !== 1 ? "es" : ""} registrado{filas.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Buscar proveedor..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mercasa-blue transition-all bg-white"
            />
            <button
              onClick={descargarCSV}
              className="bg-mercasa-blue hover:bg-mercasa-blue-dark text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
              Descargar CSV
            </button>
            <button
              onClick={handleLogout}
              className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-xl text-sm font-semibold transition-colors border border-slate-200"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* Formulario de Registro eliminado por simplificación */}

        {/* Tabla */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-slate-200">
          {cargando ? (
            <div className="p-12 text-center text-slate-400 font-medium">Cargando datos...</div>
          ) : filasFiltradas.length === 0 ? (
            <div className="p-12 text-center text-slate-400 font-medium">
              {busqueda ? "No se encontraron resultados." : "No hay registros aún."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-mercasa-blue text-white text-xs uppercase tracking-wider">
                  <tr>
                    {HEADERS.map((h) => (
                      <th
                        key={h}
                        className="px-6 py-4 text-left font-bold whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filasFiltradas.map((fila, i) => (
                    <tr
                      key={i}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      {HEADERS.map((_, j) => (
                        <td
                          key={j}
                          className="px-6 py-4 text-slate-600 whitespace-nowrap"
                        >
                          {fila[j] ?? "—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}