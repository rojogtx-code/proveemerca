"use client";

import { useEffect, useState } from "react";
import Papa from "papaparse";
import Image from "next/image";
import { useRouter } from "next/navigation";

type Fila = string[];

const HEADERS = [
  "id", "fecha_registro", "tipo_cedula_id", "tipo_cedula_nombre", "es_compania", "cedula",
  "nombre_proveedor", "tiene_actividad", "codigo_act_economica", "act_economica_principal",
  "codigo_provincia", "provincia", "codigo_canton", "canton", "codigo_distrito", "distrito",
  "codigo_barrio", "barrio", "direccion_exacta", "forma_pago", "plazo_pago_dias",
  "moneda_credito", "monto_credito", "email_factura", "correo_comprobantes", "cuentas_bancarias",
  "ventas_nombre", "ventas_email", "ventas_telefono", "ventas_whatsapp",
  "tiene_facturador", "facturador_nombre", "facturador_email", "facturador_telefono", "facturador_whatsapp",
  "tiene_cobros", "cobros_nombre", "cobros_email", "cobros_telefono", "cobros_whatsapp",
  "es_cliente", "es_proveedor"
];

export default function AdminPage() {
  const [filas, setFilas] = useState<Fila[]>([]);
  // Estado para admin
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const router = useRouter();

  // Estados para la nueva vista de validación de proveedores
  interface ValidacionFila {
    cedula: string;
    nombre: string;
    estado_formulario: "Pendiente" | "Completado";
    updated_at: string;
  }
  const [vistaActiva, setVistaActiva] = useState<"detallados" | "validacion">("detallados");
  const [filasValidacion, setFilasValidacion] = useState<ValidacionFila[]>([]);
  const [cargandoValidacion, setCargandoValidacion] = useState(false);
  const [busquedaValidacion, setBusquedaValidacion] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<"Todos" | "Pendiente" | "Completado">("Todos");

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
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401) throw new Error("No autorizado. Redirigiendo...");
          throw new Error(`Error del servidor: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (!data || !data.rows) {
          throw new Error(data?.error || "No se pudieron cargar los datos.");
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mappedRows = data.rows.map((p: any) => [
          p.id,
          new Date(p.created_at).toLocaleString("es-CR"),
          p.tipo_cedula_id,
          p.tipo_cedula_nombre,
          p.es_compania,
          p.cedula,
          p.nombre_proveedor,
          p.tiene_actividad,
          p.cod_actividad_economica || "—",
          p.act_economica_principal,
          p.codigo_provincia,
          p.provincia,
          p.codigo_canton,
          p.canton,
          p.codigo_distrito,
          p.distrito,
          p.codigo_barrio,
          p.barrio,
          p.direccion_exacta,
          p.forma_pago,
          p.plazo_pago_dias,
          p.moneda_credito || "—",
          p.monto_credito || "—",
          p.email_factura || "—",
          p.correo_comprobantes || "—",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (p.cuentas_bancarias || []).map((c: any) => `${c.banco_nombre} (${c.moneda}): ${c.iban}`).join(" | ") || "Sin cuentas",
          p.ventas_nombre,
          p.ventas_email,
          p.ventas_telefono,
          p.ventas_whatsapp || "—",
          p.tiene_facturador ? "Sí" : "No",
          p.facturador_nombre || "—",
          p.facturador_email || "—",
          p.facturador_telefono || "—",
          p.facturador_whatsapp || "—",
          p.tiene_cobros ? "Sí" : "No",
          p.cobros_nombre || "—",
          p.cobros_email || "—",
          p.cobros_telefono || "—",
          p.cobros_whatsapp || "—",
          p.es_cliente,
          p.es_proveedor,
        ]);
        setFilas(mappedRows);
      })
      .catch((err) => {
        console.error("Error en el panel administrador:", err);
        if (err.message.includes("No autorizado")) {
          router.push("/login");
        }
      })
      .finally(() => setCargando(false));
  }, [router]);

  const cargarValidacion = () => {
    setCargandoValidacion(true);
    fetch("/api/validacion-proveedores")
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401) throw new Error("No autorizado. Redirigiendo...");
          throw new Error(`Error del servidor: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (!data || !data.rows) {
          throw new Error(data?.error || "No se pudieron cargar los datos.");
        }
        setFilasValidacion(data.rows);
      })
      .catch((err) => {
        console.error("Error cargando validación:", err);
        if (err.message.includes("No autorizado")) {
          router.push("/login");
        }
      })
      .finally(() => setCargandoValidacion(false));
  };

  useEffect(() => {
    if (vistaActiva === "validacion") {
      cargarValidacion();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vistaActiva]);

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

  function descargarCSVValidacion() {
    const dataFiltrada = filasValidacionFiltradas.map((f) => [
      f.cedula,
      f.nombre,
      f.estado_formulario,
      new Date(f.updated_at).toLocaleString("es-CR")
    ]);
    const csv = Papa.unparse({
      fields: ["Cédula", "Nombre", "Estado", "Fecha de Actualización"],
      data: dataFiltrada
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `control-validacion-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const filasFiltradas = filas.filter((fila) =>
    fila.some((celda) =>
      String(celda || "").toLowerCase().includes(busqueda.toLowerCase())
    )
  );

  const filasValidacionFiltradas = filasValidacion.filter((f) => {
    // 1. Filtrar por estado
    if (filtroEstado !== "Todos" && f.estado_formulario !== filtroEstado) {
      return false;
    }
    // 2. Filtrar por búsqueda (nombre o cédula)
    if (busquedaValidacion.trim() !== "") {
      const query = busquedaValidacion.toLowerCase();
      return (
        f.cedula.toLowerCase().includes(query) ||
        f.nombre.toLowerCase().includes(query)
      );
    }
    return true;
  });

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
                {vistaActiva === "detallados"
                  ? `${filas.length} proveedor${filas.length !== 1 ? "es" : ""} registrado${filas.length !== 1 ? "s" : ""}`
                  : `${filasValidacionFiltradas.length} de ${filasValidacion.length} validaciones`
                }
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {vistaActiva === "detallados" ? (
              <input
                type="text"
                placeholder="Buscar proveedor..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mercasa-blue transition-all bg-white"
              />
            ) : (
              <>
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value as any)}
                  className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mercasa-blue bg-white text-slate-600 font-semibold cursor-pointer"
                >
                  <option value="Todos">Todos los Estados</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Completado">Completado</option>
                </select>
                <input
                  type="text"
                  placeholder="Buscar cédula o nombre..."
                  value={busquedaValidacion}
                  onChange={(e) => setBusquedaValidacion(e.target.value)}
                  className="border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mercasa-blue transition-all bg-white w-64"
                />
              </>
            )}
            <button
              onClick={vistaActiva === "detallados" ? descargarCSV : descargarCSVValidacion}
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

        {/* Pestañas de Vista */}
        <div className="flex border-b border-slate-200 mb-6 gap-2">
          <button
            onClick={() => setVistaActiva("detallados")}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              vistaActiva === "detallados"
                ? "border-mercasa-blue text-mercasa-blue font-bold"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" x2="15" y1="3" y2="3"/><line x1="9" x2="15" y1="21" y2="21"/><line x1="3" x2="3" y1="9" y2="15"/><line x1="21" x2="21" y1="9" y2="15"/><line x1="9" x2="9" y1="9" y2="15"/><line x1="15" x2="15" y1="9" y2="15"/></svg>
            Registros Detallados ({filas.length})
          </button>
          <button
            onClick={() => setVistaActiva("validacion")}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              vistaActiva === "validacion"
                ? "border-mercasa-blue text-mercasa-blue font-bold"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            Control de Validación ({filasValidacion.length})
          </button>
        </div>

        {/* Tabla Condicional */}
        {vistaActiva === "detallados" ? (
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
        ) : (
          <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-slate-200">
            {cargandoValidacion ? (
              <div className="p-12 text-center text-slate-400 font-medium">Cargando control de validación...</div>
            ) : filasValidacionFiltradas.length === 0 ? (
              <div className="p-12 text-center text-slate-400 font-medium">
                No se encontraron proveedores que coincidan con la búsqueda o filtro.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-100 text-slate-700 text-xs uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left font-bold whitespace-nowrap">Cédula</th>
                      <th className="px-6 py-4 text-left font-bold whitespace-nowrap">Nombre / Razón Social</th>
                      <th className="px-6 py-4 text-left font-bold whitespace-nowrap">Estado</th>
                      <th className="px-6 py-4 text-left font-bold whitespace-nowrap">Fecha de Actualización</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filasValidacionFiltradas.map((fila) => (
                      <tr
                        key={fila.cedula}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-slate-900 font-semibold whitespace-nowrap">
                          {fila.cedula}
                        </td>
                        <td className="px-6 py-4 text-slate-700 font-medium whitespace-nowrap">
                          {fila.nombre}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
                            fila.estado_formulario === "Completado"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}>
                            {fila.estado_formulario}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                          {new Date(fila.updated_at).toLocaleString("es-CR")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}