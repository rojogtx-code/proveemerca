"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface CuentaBancaria {
  id: string;
  banco_nombre: string;
  moneda: string;
  iban: string;
  cuenta_corriente: string | null;
  orden: number;
}

interface Proveedor {
  cedula: string;
  nombre_proveedor: string;
  tipo_cedula_nombre: string | null;
  es_compania: string | null;
  es_cliente: string | null;
  act_economica_principal: string | null;
  cod_actividad_economica: string | null;
  tiene_actividad: number | null;
  provincia: string | null;
  canton: string | null;
  distrito: string | null;
  barrio: string | null;
  direccion_exacta: string | null;
  forma_pago: string | null;
  plazo_pago_dias: string | null;
  moneda_credito: string | null;
  monto_credito: string | null;
  email_factura: string | null;
  correo_comprobantes: string | null;
  ventas_nombre: string | null;
  ventas_email: string | null;
  ventas_telefono: string | null;
  ventas_ext_telefono: string | null;
  ventas_whatsapp: string | null;
  ventas_ext_whatsapp: string | null;
  tiene_facturador: boolean;
  facturador_nombre: string | null;
  facturador_email: string | null;
  facturador_telefono: string | null;
  facturador_ext_telefono: string | null;
  facturador_whatsapp: string | null;
  facturador_ext_whatsapp: string | null;
  tiene_cobros: boolean;
  cobros_nombre: string | null;
  cobros_email: string | null;
  cobros_telefono: string | null;
  cobros_ext_telefono: string | null;
  cobros_whatsapp: string | null;
  cobros_ext_whatsapp: string | null;
  cuentas_bancarias: CuentaBancaria[];
}

function val(v: unknown): string {
  if (v === null || v === undefined) return "—";
  const s = String(v).trim();
  return s === "" ? "—" : s;
}

function telefono(numero: string | null, ext: string | null): string {
  if (!numero || numero.trim() === "") return "—";
  return `+${ext || "506"} ${numero}`;
}

function Campo({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wide">{label}</span>
      <span className="text-[10px] text-slate-800 break-words">{value}</span>
    </div>
  );
}

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="print:break-inside-avoid mb-2.5">
      <div className="bg-mercasa-blue text-white text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-t">
        {titulo}
      </div>
      <div className="border border-t-0 border-slate-200 rounded-b p-2 grid grid-cols-3 gap-x-3 gap-y-1.5">
        {children}
      </div>
    </div>
  );
}

export default function GenerarPDF() {
  const [cedula, setCedula] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proveedor, setProveedor] = useState<Proveedor | null>(null);
  const router = useRouter();

  async function buscar(e: React.FormEvent) {
    e.preventDefault();
    const cedulaLimpia = cedula.trim();
    if (!/^\d{9,12}$/.test(cedulaLimpia)) {
      setError("Ingrese una cédula válida (entre 9 y 12 dígitos).");
      setProveedor(null);
      return;
    }

    setBuscando(true);
    setError(null);
    setProveedor(null);
    try {
      const res = await fetch(`/api/proveedores/buscar?cedula=${encodeURIComponent(cedulaLimpia)}`);
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "No se pudo buscar el proveedor.");
        return;
      }
      setProveedor(data.proveedor);
    } catch (err) {
      console.error("Error buscando proveedor:", err);
      setError("Error de conexión al buscar el proveedor.");
    } finally {
      setBuscando(false);
    }
  }

  return (
    <div>
      {/* Controles de búsqueda: no se imprimen */}
      <div className="print:hidden bg-white rounded-2xl shadow-md border border-slate-200 p-6">
        <form onSubmit={buscar} className="flex flex-wrap items-end gap-3 mb-6">
          <div className="flex-1 min-w-[240px]">
            <label htmlFor="cedula-pdf" className="block text-xs font-semibold text-slate-500 mb-1">
              Número de cédula del proveedor
            </label>
            <input
              id="cedula-pdf"
              type="text"
              inputMode="numeric"
              placeholder="Ej: 310123456"
              value={cedula}
              onChange={(e) => setCedula(e.target.value.replace(/\D/g, ""))}
              className="border border-slate-200 rounded-xl px-4 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-mercasa-blue transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={buscando}
            className="bg-mercasa-blue hover:bg-mercasa-blue-dark disabled:opacity-50 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-colors"
          >
            {buscando ? "Buscando..." : "Buscar"}
          </button>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
            {error}
          </div>
        )}

        {proveedor && (
          <div className="border border-slate-200 rounded-xl p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Proveedor encontrado</p>
                <p className="text-lg font-bold text-slate-800">{val(proveedor.nombre_proveedor)}</p>
                <p className="text-sm text-slate-500">Cédula: {val(proveedor.cedula)} · {val(proveedor.tipo_cedula_nombre)}</p>
              </div>
              <button
                onClick={() => window.print()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                Generar PDF
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-3">
              Se abrirá el diálogo de impresión de tu navegador — elige &quot;Guardar como PDF&quot; como destino para descargar la ficha.
            </p>
          </div>
        )}
      </div>

      {/* Ficha imprimible: oculta en pantalla, visible solo al imprimir */}
      {proveedor && (
        <div className="hidden print:block text-slate-900">
          <div className="flex items-center justify-between border-b-2 border-mercasa-blue pb-2 mb-3">
            <h1 className="text-base font-bold">Ficha de Proveedor — Mercasa</h1>
            <span className="text-[9px] text-slate-500">Generado el {new Date().toLocaleString("es-CR")}</span>
          </div>

          <Seccion titulo="Identificación">
            <Campo label="Cédula" value={val(proveedor.cedula)} />
            <Campo label="Tipo" value={val(proveedor.tipo_cedula_nombre)} />
            <Campo label="Es Compañía" value={val(proveedor.es_compania)} />
            <div className="col-span-3">
              <Campo label="Nombre / Razón Social" value={val(proveedor.nombre_proveedor)} />
            </div>
            <Campo label="Es Cliente" value={val(proveedor.es_cliente)} />
          </Seccion>

          <Seccion titulo="Actividad Económica">
            <Campo label="Código" value={val(proveedor.cod_actividad_economica)} />
            <Campo label="Tiene Actividad" value={proveedor.tiene_actividad ? "Sí" : "No"} />
            <div className="col-span-3">
              <Campo label="Descripción" value={val(proveedor.act_economica_principal)} />
            </div>
          </Seccion>

          <Seccion titulo="Ubicación">
            <Campo label="Provincia" value={val(proveedor.provincia)} />
            <Campo label="Cantón" value={val(proveedor.canton)} />
            <Campo label="Distrito" value={val(proveedor.distrito)} />
            <Campo label="Barrio" value={val(proveedor.barrio)} />
            <div className="col-span-2">
              <Campo label="Dirección Exacta" value={val(proveedor.direccion_exacta)} />
            </div>
          </Seccion>

          <Seccion titulo="Condiciones Comerciales">
            <Campo label="Forma de Pago" value={val(proveedor.forma_pago)} />
            <Campo label="Plazo" value={val(proveedor.plazo_pago_dias)} />
            <Campo label="Moneda Crédito" value={val(proveedor.moneda_credito)} />
            <Campo label="Monto Crédito" value={val(proveedor.monto_credito)} />
            <Campo label="Email Factura" value={val(proveedor.email_factura)} />
            <Campo label="Correo Comprobantes" value={val(proveedor.correo_comprobantes)} />
          </Seccion>

          <Seccion titulo="Contacto de Ventas">
            <Campo label="Nombre" value={val(proveedor.ventas_nombre)} />
            <Campo label="Email" value={val(proveedor.ventas_email)} />
            <Campo label="Teléfono" value={telefono(proveedor.ventas_telefono, proveedor.ventas_ext_telefono)} />
            <Campo label="WhatsApp" value={telefono(proveedor.ventas_whatsapp, proveedor.ventas_ext_whatsapp)} />
          </Seccion>

          {proveedor.tiene_facturador && (
            <Seccion titulo="Contacto de Facturación">
              <Campo label="Nombre" value={val(proveedor.facturador_nombre)} />
              <Campo label="Email" value={val(proveedor.facturador_email)} />
              <Campo label="Teléfono" value={telefono(proveedor.facturador_telefono, proveedor.facturador_ext_telefono)} />
              <Campo label="WhatsApp" value={telefono(proveedor.facturador_whatsapp, proveedor.facturador_ext_whatsapp)} />
            </Seccion>
          )}

          {proveedor.tiene_cobros && (
            <Seccion titulo="Contacto de Cobros">
              <Campo label="Nombre" value={val(proveedor.cobros_nombre)} />
              <Campo label="Email" value={val(proveedor.cobros_email)} />
              <Campo label="Teléfono" value={telefono(proveedor.cobros_telefono, proveedor.cobros_ext_telefono)} />
              <Campo label="WhatsApp" value={telefono(proveedor.cobros_whatsapp, proveedor.cobros_ext_whatsapp)} />
            </Seccion>
          )}

          <Seccion titulo="Cuentas Bancarias">
            {!proveedor.cuentas_bancarias || proveedor.cuentas_bancarias.length === 0 ? (
              <div className="col-span-3 text-[10px] text-slate-500">Sin cuentas bancarias registradas.</div>
            ) : (
              [...proveedor.cuentas_bancarias]
                .sort((a, b) => a.orden - b.orden)
                .map((c) => (
                  <div className="col-span-3" key={c.id}>
                    <Campo
                      label={`Cuenta ${c.orden}`}
                      value={`${val(c.banco_nombre)} (${val(c.moneda)}) — IBAN: ${val(c.iban)}${c.cuenta_corriente ? ` — Cta. Corriente: ${c.cuenta_corriente}` : ""}`}
                    />
                  </div>
                ))
            )}
          </Seccion>

          <p className="text-[8px] text-slate-400 mt-2">
            Documento generado automáticamente desde el panel administrativo de Mercasa.
          </p>
        </div>
      )}
    </div>
  );
}
