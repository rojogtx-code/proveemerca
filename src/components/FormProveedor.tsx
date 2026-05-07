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
    defaultValues: {
      telefono: "+506 ",
      whatsapp: "+506 ",
    },
  });

  const formatPhoneNumber = (value: string) => {
    // Quitar todo lo que no sea número después del +506
    const numbers = value.replace("+506 ", "").replace(/\D/g, "");
    const charCount = numbers.length;

    if (charCount <= 4) {
      return `+506 ${numbers}`;
    } else {
      return `+506 ${numbers.slice(0, 4)}-${numbers.slice(4, 8)}`;
    }
  };

  async function buscarCedula() {
    if (cedula.length < 9) return;
    setBuscando(true);
    setErrorHacienda("");
    setDatosHacienda(null);
    setSinActividad(false);

    try {
      const res = await fetch(`/api/hacienda?identificacion=${cedula}`);
      const data = await res.json();

      // Validar si tiene actividades económicas
      if (!data.tieneActividad) {
        setSinActividad(true);
        setBuscando(false);
        return;
      }

      if (!data.nombre) throw new Error("Sin nombre");
      
      setDatosHacienda(data);
      setValue("cedula", cedula);
      setValue("nombreProveedor", data.nombre);
      
      // Verificar si ya existe en la base de datos
      try {
        const putRes = await fetch("/api/verificar-cedula", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cedula }),
        });
        if (putRes.ok) {
          const putData = await putRes.json();
          if (putData.existe) {
            setExisteRegistro(true);
            setMostrarConfirmacion(true);
          }
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
      {/* Modal de Confirmación Duplicado */}
      {mostrarConfirmacion && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-orange-100 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Cédula ya ingresada</h3>
              <p className="text-slate-600 mb-6">
                Ya tenemos un registro con esta identificación. ¿Deseas actualizar la información existente o mantener los datos actuales?
              </p>
              <div className="flex flex-col w-full gap-3">
                <button
                  type="button"
                  onClick={() => setMostrarConfirmacion(false)}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-orange-200 active:scale-[0.98]"
                >
                  Actualizar los datos de nuevo
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMostrarConfirmacion(false);
                    setDatosHacienda(null);
                    setCedula("");
                    setValue("cedula", "");
                  }}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 rounded-xl transition-all active:scale-[0.98]"
                >
                  Cancelar
                </button>
              </div>
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
                onChange={(e) => {
                  const selectedAct = datosHacienda.actividades.find(
                    (act) => act.codigo === e.target.value
                  );
                  if (selectedAct) {
                    setValue("codActividadEconomica", selectedAct.codigo);
                    setValue("actEconomicaPrincipal", selectedAct.descripcion);
                  } else {
                    setValue("codActividadEconomica", "");
                    setValue("actEconomicaPrincipal", "");
                  }
                }}
                className="border border-slate-300 bg-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-mercasa-blue transition-all appearance-none"
              >
                <option value="">Seleccione una actividad</option>
                {datosHacienda.actividades
                  ?.filter((act) => act.estado === "A")
                  .map((act) => (
                    <option key={act.codigo} value={act.codigo}>
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

        {/* Información de Contacto */}
        {datosHacienda && (
          <div className="flex flex-col gap-6 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-mercasa-blue uppercase tracking-widest">
              Información de Contacto
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Email Factura Electrónica</label>
                <input
                  type="email"
                  {...register("emailFactura")}
                  placeholder="facturacion@ejemplo.com"
                  className="border border-slate-300 bg-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-mercasa-blue transition-all"
                />
                {errors.emailFactura && <span className="text-xs text-red-500">{errors.emailFactura.message}</span>}
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Email de Contacto</label>
                <input
                  type="email"
                  {...register("emailContacto")}
                  placeholder="contacto@ejemplo.com"
                  className="border border-slate-300 bg-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-mercasa-blue transition-all"
                />
                {errors.emailContacto && <span className="text-xs text-red-500">{errors.emailContacto.message}</span>}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Nombre de la Persona de Contacto</label>
              <input
                type="text"
                {...register("nombreContacto")}
                onChange={(e) => {
                  // Solo letras y espacios
                  const val = e.target.value.replace(/[^A-Za-záéíóúÁÉÍÓÚñÑüÜ\s]/g, "");
                  setValue("nombreContacto", val);
                }}
                placeholder="Nombre Apellido1 Apellido2"
                className="border border-slate-300 bg-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-mercasa-blue transition-all"
              />
              <p className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">Solo letras. Debe incluir Nombre y ambos Apellidos</p>
              {errors.nombreContacto && <span className="text-xs text-red-500">{errors.nombreContacto.message}</span>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Número de Teléfono</label>
                <input
                  type="text"
                  {...register("telefono")}
                  onChange={(e) => {
                    setValue("telefono", formatPhoneNumber(e.target.value));
                  }}
                  placeholder="+506 0000-0000"
                  className="border border-slate-300 bg-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-mercasa-blue transition-all font-mono"
                />
                {errors.telefono && <span className="text-xs text-red-500">{errors.telefono.message}</span>}
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Número de WhatsApp</label>
                <input
                  type="text"
                  {...register("whatsapp")}
                  onChange={(e) => {
                    setValue("whatsapp", formatPhoneNumber(e.target.value));
                  }}
                  placeholder="+506 0000-0000"
                  className="border border-slate-300 bg-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-mercasa-blue transition-all font-mono"
                />
                {errors.whatsapp && <span className="text-xs text-red-500">{errors.whatsapp.message}</span>}
              </div>
            </div>
          </div>
        )}

        {/* Botón enviar */}
        {datosHacienda && (
          <button
            type="submit"
            disabled={enviando}
            className="bg-mercasa-green text-white py-4 rounded-xl font-bold text-lg hover:bg-mercasa-green-dark shadow-lg shadow-green-900/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {enviando ? "Procesando..." : "Enviar Información Actualizada"}
          </button>
        )}
      </form>
    </>
  );
}