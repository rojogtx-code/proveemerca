"use client";

import { useEffect, useState } from "react";
import Papa from "papaparse";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

type Fila = string[];

const HEADERS = [
  "Fecha", "Cédula", "Nombre Proveedor", "Act. Económica",
  "Provincia", "Cód. Provincia", "Cantón", "Cód. Cantón",
  "Distrito", "Cód. Distrito", "Barrio", "Cód. Barrio", "Dirección Exacta",
];

export default function AdminPage() {
  const [filas, setFilas] = useState<Fila[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const supabase = createClient();
  const router = useRouter();

  // Estado para registro de usuario
  const [nuevoEmail, setNuevoEmail] = useState("");
  const [nuevaPass, setNuevaPass] = useState("");
  const [errorRegistro, setErrorRegistro] = useState("");
  const [exitoRegistro, setExitoRegistro] = useState("");
  const [registrando, setRegistrando] = useState(false);
  const [mostrarFormRegistro, setMostrarFormRegistro] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorRegistro("");
    setExitoRegistro("");

    // Validación alfanumérica de 6 dígitos
    const regex = /^[a-zA-Z0-9]{6}$/;
    if (!regex.test(nuevaPass)) {
      setErrorRegistro("La contraseña debe ser alfanumérica de exactamente 6 caracteres.");
      return;
    }

    setRegistrando(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: nuevoEmail,
        password: nuevaPass,
      });

      if (error) throw error;

      setExitoRegistro("Usuario registrado con éxito. El usuario debe confirmar su correo (si está habilitado).");
      setNuevoEmail("");
      setNuevaPass("");
      setTimeout(() => setMostrarFormRegistro(false), 3000);
    } catch (err: any) {
      setErrorRegistro(err.message || "Error al registrar usuario.");
    } finally {
      setRegistrando(false);
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
          p.act_economica_principal,
          p.provincia,
          p.codigo_provincia,
          p.canton,
          p.codigo_canton,
          p.distrito,
          p.codigo_distrito,
          p.barrio,
          p.codigo_barrio,
          p.direccion_exacta,
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
            <div className="relative w-32 h-12">
              <Image
                src="/logo.png"
                alt="Logo Mercasa"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Panel Administrador
              </h1>
              <p className="text-sm text-slate-500">
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
              onClick={() => setMostrarFormRegistro(!mostrarFormRegistro)}
              className="bg-white hover:bg-slate-50 text-mercasa-blue px-4 py-2 rounded-xl text-sm font-semibold transition-all border border-mercasa-blue"
            >
              Registrar Usuario
            </button>
            <button
              onClick={handleLogout}
              className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-xl text-sm font-semibold transition-colors border border-slate-200"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* Formulario de Registro (Colapsable) */}
        {mostrarFormRegistro && (
          <div className="mb-8 bg-white p-6 rounded-2xl shadow-sm border border-mercasa-blue/20 animate-in fade-in slide-in-from-top-4 duration-300">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Registrar Nuevo Usuario</h2>
            <form onSubmit={handleRegistro} className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  placeholder="ejemplo@mercasa.com"
                  value={nuevoEmail}
                  onChange={(e) => setNuevoEmail(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-mercasa-blue outline-none"
                />
              </div>
              <div className="flex-1 space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Contraseña (6 alfanum.)</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="ABC123"
                  value={nuevaPass}
                  onChange={(e) => setNuevaPass(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-mercasa-blue outline-none font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={registrando}
                className="bg-mercasa-red hover:bg-mercasa-red-dark text-white px-6 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-50 h-[38px]"
              >
                {registrando ? "Registrando..." : "Crear Cuenta"}
              </button>
            </form>
            {errorRegistro && <p className="mt-2 text-xs text-red-500 font-medium">{errorRegistro}</p>}
            {exitoRegistro && <p className="mt-2 text-xs text-green-600 font-medium">{exitoRegistro}</p>}
          </div>
        )}

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