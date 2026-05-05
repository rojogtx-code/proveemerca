"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { proveedorSchema, ProveedorFormData } from "@/lib/validations";
import UbicacionCR from "./UbicacionCR";

type ActividadEconomica = {
  codigo: string;
  descripcion: string;
  estado: string;
  tipo: string;
};

type DatosHacienda = {
  nombre: string;
  actividades: ActividadEconomica[];
};

export default function FormProveedor() {
  const [cedula, setCedula] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [datosHacienda, setDatosHacienda] = useState<DatosHacienda | null>(null);
  const [errorHacienda, setErrorHacienda] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [existeRegistro, setExisteRegistro] = useState(false);
  const [sinActividad, setSinActividad] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [datosPendientes, setDatosPendientes] = useState<ProveedorFormData | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<ProveedorFormData>({
    resolver: zodResolver(proveedorSchema),
  });

  async function buscarCedula() {
    if (cedula.length < 9) return;
    setBuscando(true);
    setErrorHacienda("");
    setDatosHacienda(null);
    setSinActividad(false);

    try {
      const res = await fetch(`/api/hacienda?identificacion=${cedula}`);
      if (!res.ok) throw new Error("No encontrado");
      const data = await res.json();
      if (!data.nombre) throw new Error("Sin nombre");

      // Validar si tiene actividades económicas
      if (!data.actividades || data.actividades.length === 0) {
        setSinActividad(true);
        setBuscando(false);
        return;
      }

      setDatosHacienda(data);
      setValue("cedula", cedula);
      setValue("nombreProveedor", data.nombre);
      
      // Verificar si ya existe en Google Sheets
      try {
        const putRes = await fetch("/api/verificar-cedula", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cedula }),
        });
        if (putRes.ok) {
          const putData = await putRes.json();
          setExisteRegistro(putData.existe);
        }
      } catch (e) {
        console.error("Error verificando existencia:", e);
      }
    } catch {
      setErrorHacienda("No se encontró el contribuyente en Hacienda. Verifique el número.");
    } finally {
      setBuscando(false);
    }
  }

  async function onSubmit(data: ProveedorFormData) {
    if (existeRegistro) {
      setDatosPendientes(data);
      setMostrarConfirmacion(true);
      return;
    }
    await enviarDatos(data);
  }

  async function enviarDatos(data: ProveedorFormData) {
    setEnviando(true);
    try {
      const payload = { ...data, actualizar: existeRegistro };
      const res = await fetch("/api/proveedores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Error al enviar");
      setEnviado(true);
      reset();
      setCedula("");
      setDatosHacienda(null);
      setExisteRegistro(false);
      setMostrarConfirmacion(false);
      setDatosPendientes(null);
    } catch {
      alert("Ocurrió un error al enviar el formulario. Intente de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  if (enviado) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          ¡Información enviada con éxito!
        </h2>
        <p className="text-gray-500 mb-6">Gracias por actualizar sus datos.</p>
        <button
          onClick={() => setEnviado(false)}
          className="bg-mercasa-blue text-white px-8 py-3 rounded-xl hover:bg-mercasa-blue-dark shadow-lg shadow-blue-900/20 transition-all active:scale-95 font-medium"
        >
          Enviar otro registro
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Modal de Confirmación */}
      {mostrarConfirmacion && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                ⚠️
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Registro Duplicado</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Ya tenemos un registro con esta cédula. <br />
                <span className="font-bold text-slate-700">¿Deseas actualizar la información existente con estos nuevos datos?</span>
              </p>
            </div>
            <div className="flex border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setMostrarConfirmacion(false);
                  setDatosPendientes(null);
                }}
                className="flex-1 px-6 py-4 text-sm font-semibold text-slate-500 hover:bg-slate-50 transition-colors border-r border-slate-100"
              >
                Mantener actuales
              </button>
              <button
                type="button"
                onClick={() => datosPendientes && enviarDatos(datosPendientes)}
                className="flex-1 px-6 py-4 text-sm font-bold text-mercasa-blue hover:bg-blue-50 transition-colors"
              >
                Sí, actualizar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alerta Sin Actividad */}
      {sinActividad && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-red-100 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Sin Actividad Económica</h3>
              <p className="text-slate-600 mb-6">
                Esta cédula no registra actividades económicas activas en Hacienda. No podrá realizar el registro.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSinActividad(false);
                  setCedula("");
                  setValue("cedula", "");
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-red-200"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">

        {/* Cédula */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            Número de Identificación
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={cedula}
              onChange={(e) => {
                setCedula(e.target.value.replace(/\D/g, ""));
                setErrorHacienda("");
                setDatosHacienda(null);
                setExisteRegistro(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  buscarCedula();
                }
              }}
              placeholder="Ej: 3101123456"
              maxLength={12}
              className="flex-1 border border-slate-300 bg-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-mercasa-blue transition-all"
            />
            <button
              type="button"
              onClick={buscarCedula}
              disabled={cedula.length < 9 || buscando}
              className="bg-mercasa-blue text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-mercasa-blue-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md active:scale-95"
            >
              {buscando ? "..." : "Validar"}
            </button>
          </div>
          {errorHacienda && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">
              ❌ {errorHacienda}
            </div>
          )}
        </div>

        {/* Datos Hacienda */}
        {datosHacienda && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex flex-col gap-4 transition-all">
            {existeRegistro && (
              <div className="bg-amber-100 border border-amber-300 text-amber-800 text-xs px-4 py-3 rounded-xl mb-2 flex items-start gap-2">
                <span className="text-lg">⚠️</span>
                <span>Ya tenemos un registro con esta cédula. Tus datos serán <strong>actualizados</strong> al enviar.</span>
              </div>
            )}
            <h3 className="text-xs font-bold text-mercasa-blue uppercase tracking-widest">
              Datos Fiscales
            </h3>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Nombre del Proveedor
              </label>
              <input
                type="text"
                readOnly
                value={datosHacienda.nombre}
                className="border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600 cursor-not-allowed"
              />
              <input type="hidden" {...register("nombreProveedor")} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Actividad Económica Principal
              </label>
              <select
                {...register("actEconomicaPrincipal")}
                className="border border-slate-300 bg-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-mercasa-blue transition-all appearance-none"
              >
                <option value="">Seleccione una actividad</option>
                {datosHacienda.actividades
                  ?.filter((act) => act.estado === "A")
                  .map((act) => (
                    <option key={act.codigo} value={`${act.codigo} - ${act.descripcion}`}>
                      {act.tipo === "P" ? "⭐ Principal" : "Secundaria"} — {act.codigo} · {act.descripcion}
                    </option>
                  ))}
              </select>
              {errors.actEconomicaPrincipal && (
                <span className="text-xs text-red-500">
                  {errors.actEconomicaPrincipal.message}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Ubicación */}
        {datosHacienda && (
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Ubicación
            </h3>
            <UbicacionCR register={register} setValue={setValue} errors={errors} />
          </div>
        )}

        {/* Dirección */}
        {datosHacienda && (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Dirección Exacta
            </label>
            <textarea
              {...register("direccionExacta")}
              rows={3}
              placeholder="Ej: 200 metros norte de la iglesia, casa azul con portón negro"
              className="border border-slate-300 bg-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-mercasa-blue transition-all resize-none"
            />
            {errors.direccionExacta && (
              <span className="text-xs text-red-500">
                {errors.direccionExacta.message}
              </span>
            )}
          </div>
        )}

        {/* Botón enviar */}
        {datosHacienda && (
          <button
            type="submit"
            disabled={enviando}
            className="bg-mercasa-red text-white py-4 rounded-xl font-bold text-lg hover:bg-mercasa-red-dark shadow-lg shadow-red-900/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {enviando ? "Procesando..." : "Enviar Información Actualizada"}
          </button>
        )}
      </form>
    </>
  );
}