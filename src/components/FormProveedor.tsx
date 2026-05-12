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
  tipoCedulaId?: string;
  tipoCedulaNombre?: string;
  tieneActividad?: boolean;
};

export default function FormProveedor() {
  const [cedula, setCedula] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [datosHacienda, setDatosHacienda] = useState<DatosHacienda | null>(null);
  const [errorHacienda, setErrorHacienda] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [existeRegistro, setExisteRegistro] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [datosPendientes, setDatosPendientes] = useState<ProveedorFormData | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
    reset,
  } = useForm<ProveedorFormData>({
    resolver: zodResolver(proveedorSchema),
    defaultValues: {
      ventasTelefono: "",
      ventasCelular: "",
      cobrosTelefono: "",
      cobrosCelular: "",
      tieneActividad: false,
    },
  });

  const plazoPagoDiasValor = watch("plazoPagoDias");
  const esCredito = plazoPagoDiasValor && plazoPagoDiasValor !== "0";

  const copiarDatosVentasACobros = () => {
    const values = getValues();
    setValue("cobrosNombre", values.ventasNombre || "", { shouldValidate: true });
    setValue("cobrosEmail", values.ventasEmail || "", { shouldValidate: true });
    setValue("cobrosTelefono", values.ventasTelefono || "", { shouldValidate: true });
    setValue("cobrosCelular", values.ventasCelular || "", { shouldValidate: true });
  };

  const soloNumeros = (value: string, maxLen: number) =>
    value.replace(/\D/g, "").slice(0, maxLen);


  async function buscarCedula() {
    if (cedula.length < 9) return;
    setBuscando(true);
    setErrorHacienda("");
    setDatosHacienda(null);

    try {
      const res = await fetch(`/api/hacienda?identificacion=${cedula}`);
      const data = await res.json();

      setValue("tieneActividad", !!data.tieneActividad);
      setValue("tipoCedulaId", data.tipoCedulaId || "");
      setValue("tipoCedulaNombre", data.tipoCedulaNombre || "");

      if (!data.tieneActividad) {
        setValue("codActividadEconomica", "");
        setValue("actEconomicaPrincipal", "");
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
      setErrorHacienda("En este momento no se puede validar el número de cédula, esperar unos segundos y volver a intentar. Gracias");
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
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
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

      {/* Alerta Sin Actividad eliminada para permitir registro sin actividades */}

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

        {/* Datos Hacienda: Panel de resumen visible tras validar cédula */}
        {datosHacienda && (
          <>
            {/* Campos ocultos para tipo de cédula y actividad */}
            <input type="hidden" {...register("tipoCedulaId")} />
            <input type="hidden" {...register("tipoCedulaNombre")} />
            <input type="hidden" {...register("codActividadEconomica")} />
            <input type="hidden" {...register("actEconomicaPrincipal")} />
            <input type="hidden" {...register("tieneActividad")} />

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex flex-col gap-4">
              {existeRegistro && (
                <div className="bg-amber-100 border border-amber-300 text-amber-800 text-xs px-4 py-3 rounded-xl flex items-start gap-2">
                  <span className="text-lg">⚠️</span>
                  <span>Ya tenemos un registro con esta cédula. Tus datos serán <strong>actualizados</strong> al enviar.</span>
                </div>
              )}

              <h3 className="text-xs font-bold text-mercasa-blue uppercase tracking-widest">Datos Fiscales Confirmados</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tipo de Identificación</span>
                  <span className="text-sm font-medium text-slate-800">
                    {datosHacienda.tipoCedulaNombre ? `${datosHacienda.tipoCedulaNombre} (${datosHacienda.tipoCedulaId})` : "—"}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Nombre del Contribuyente</span>
                  <span className="text-sm font-medium text-slate-800">{datosHacienda.nombre}</span>
                </div>
              </div>

              {/* Actividad económica - solo si tiene actividades */}
              {datosHacienda.actividades && datosHacienda.actividades.length > 0 && (
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Actividad Económica Principal</label>
                  <select
                    onChange={(e) => {
                      const selected = datosHacienda.actividades.find(a => a.codigo === e.target.value);
                      if (selected) {
                        setValue("codActividadEconomica", selected.codigo);
                        setValue("actEconomicaPrincipal", selected.descripcion);
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
                  {errors.actEconomicaPrincipal && <span className="text-xs text-red-500">{errors.actEconomicaPrincipal.message}</span>}
                </div>
              )}

              <input type="hidden" {...register("nombreProveedor")} />
            </div>
          </>
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

        {/* Condiciones Comerciales */}
        {datosHacienda && (
          <div className="flex flex-col gap-6 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-mercasa-blue uppercase tracking-widest">
              Condiciones Comerciales
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Plazo de Pago</label>
                <select
                  {...register("plazoPagoDias")}
                  className="border border-slate-300 bg-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-mercasa-blue transition-all appearance-none"
                >
                  <option value="">Seleccione el plazo acordado</option>
                  <option value="0">Contado (0 días)</option>
                  <option value="15">Crédito a 15 días</option>
                  <option value="30">Crédito a 30 días</option>
                  <option value="45">Crédito a 45 días</option>
                  <option value="60">Crédito a 60 días</option>
                  <option value="90">Crédito a 90 días</option>
                  <option value="120">Crédito a 120 días</option>
                </select>
                {errors.plazoPagoDias && <span className="text-xs text-red-500">{errors.plazoPagoDias.message}</span>}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">¿Es cliente de Mercasa?</label>
                <select
                  {...register("esCliente")}
                  className="border border-slate-300 bg-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-mercasa-blue transition-all appearance-none"
                >
                  <option value="">Seleccione una opción</option>
                  <option value="Si">Sí, también compro productos</option>
                  <option value="No">No, solo soy proveedor</option>
                </select>
                {errors.esCliente && <span className="text-xs text-red-500">{errors.esCliente.message}</span>}
              </div>
            </div>

            {esCredito && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Moneda del Crédito</label>
                  <select
                    {...register("monedaCredito")}
                    className="border border-slate-300 bg-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-mercasa-blue transition-all appearance-none"
                  >
                    <option value="">Seleccione moneda</option>
                    <option value="CRC">Colones (CRC)</option>
                    <option value="USD">Dólares (USD)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Monto de Crédito Autorizado</label>
                  <input
                    type="text"
                    {...register("montoCredito")}
                    onChange={(e) => {
                      let val = e.target.value.replace(/\D/g, "");
                      if (val) {
                        val = val.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                      }
                      setValue("montoCredito", val, { shouldValidate: true });
                    }}
                    placeholder="Ej: 1.000.000"
                    className="border border-slate-300 bg-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-mercasa-blue transition-all"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1 mt-4">
              <label className="text-sm font-medium text-gray-700">Email Factura Electrónica</label>
              <input
                type="email"
                {...register("emailFactura")}
                placeholder="facturacion@ejemplo.com"
                className="border border-slate-300 bg-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-mercasa-blue transition-all"
              />
              {errors.emailFactura && <span className="text-xs text-red-500">{errors.emailFactura.message}</span>}
            </div>
          </div>
        )}

        {/* Información de Contacto */}
        {datosHacienda && (
          <div className="flex flex-col gap-6 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-mercasa-blue uppercase tracking-widest">
              Información de Contacto
            </h3>

            {/* Agente de Ventas */}
            <div className="flex flex-col gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <div className="flex flex-col">
                <h4 className="text-sm font-bold text-slate-700 uppercase">Persona encargada de la cuenta de Mercasa.</h4>
                <p className="text-sm text-slate-500">Agente de Ventas / Facturador </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Nombre Completo <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    {...register("ventasNombre")}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^A-Za-záéíóúÁÉÍÓÚñÑüÜ\s]/g, "");
                      setValue("ventasNombre", val, { shouldValidate: true });
                    }}
                    placeholder="Nombre y Apellidos"
                    className="border border-slate-300 bg-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-mercasa-blue transition-all"
                  />
                  {errors.ventasNombre && <span className="text-xs text-red-500">{errors.ventasNombre.message}</span>}
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Correo Electrónico <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    {...register("ventasEmail")}
                    placeholder="ventas@ejemplo.com"
                    className="border border-slate-300 bg-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-mercasa-blue transition-all"
                  />
                  {errors.ventasEmail && <span className="text-xs text-red-500">{errors.ventasEmail.message}</span>}
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Teléfono <span className="text-red-500">*</span></label>
                  <div className="flex gap-2">
                    <div className="flex items-center px-3 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 font-mono select-none">
                      506
                    </div>
                    <input
                      type="text"
                      {...register("ventasTelefono")}
                      onChange={(e) => setValue("ventasTelefono", soloNumeros(e.target.value, 8), { shouldValidate: true })}
                      placeholder="88888888"
                      maxLength={8}
                      className="flex-1 border border-slate-300 bg-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-mercasa-blue transition-all font-mono"
                    />
                  </div>
                  {errors.ventasTelefono && <span className="text-xs text-red-500">{errors.ventasTelefono.message}</span>}
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Celular <span className="text-red-500">*</span></label>
                  <div className="flex gap-2">
                    <div className="flex items-center px-3 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 font-mono select-none">
                      506
                    </div>
                    <input
                      type="text"
                      {...register("ventasCelular")}
                      onChange={(e) => setValue("ventasCelular", soloNumeros(e.target.value, 8), { shouldValidate: true })}
                      placeholder="88888888"
                      maxLength={8}
                      className="flex-1 border border-slate-300 bg-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-mercasa-blue transition-all font-mono"
                    />
                  </div>
                  {errors.ventasCelular && <span className="text-xs text-red-500">{errors.ventasCelular.message}</span>}
                </div>
              </div>
            </div>

            {/* Separador visual oculto a petición del usuario
            <div className="flex items-center gap-4 my-2">
              <div className="h-px bg-slate-200 flex-1"></div>
              <button
                type="button"
                onClick={copiarDatosVentasACobros}
                className="text-xs font-semibold text-mercasa-blue bg-blue-50 px-4 py-2 rounded-full hover:bg-blue-100 transition-colors border border-blue-200 active:scale-95 shadow-sm"
              >
                Copiar datos de Ventas a Cobros ↓
              </button>
              <div className="h-px bg-slate-200 flex-1"></div>
            </div>
            */}

            {/* Cuentas por Cobrar */}
            <div className="flex flex-col gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <div className="flex flex-col">
                <h4 className="text-sm font-bold text-slate-700 uppercase">Persona o departamento que gestiona los pagos.</h4>
                <p className="text-sm text-slate-500">Cuentas por Cobrar / Contabilidad</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Nombre Completo <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    {...register("cobrosNombre")}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^A-Za-záéíóúÁÉÍÓÚñÑüÜ\s]/g, "");
                      setValue("cobrosNombre", val, { shouldValidate: true });
                    }}
                    placeholder="Nombre y Apellidos"
                    className="border border-slate-300 bg-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-mercasa-blue transition-all"
                  />
                  {errors.cobrosNombre && <span className="text-xs text-red-500">{errors.cobrosNombre.message}</span>}
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Correo Electrónico <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    {...register("cobrosEmail")}
                    placeholder="cobros@ejemplo.com"
                    className="border border-slate-300 bg-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-mercasa-blue transition-all"
                  />
                  {errors.cobrosEmail && <span className="text-xs text-red-500">{errors.cobrosEmail.message}</span>}
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Teléfono (Opcional)</label>
                  <div className="flex gap-2">
                    <div className="flex items-center px-3 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 font-mono select-none">
                      506
                    </div>
                    <input
                      type="text"
                      {...register("cobrosTelefono")}
                      onChange={(e) => setValue("cobrosTelefono", soloNumeros(e.target.value, 8), { shouldValidate: true })}
                      placeholder="88888888"
                      maxLength={8}
                      className="flex-1 border border-slate-300 bg-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-mercasa-blue transition-all font-mono"
                    />
                  </div>
                  {errors.cobrosTelefono && <span className="text-xs text-red-500">{errors.cobrosTelefono.message}</span>}
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Celular <span className="text-red-500">*</span></label>
                  <div className="flex gap-2">
                    <div className="flex items-center px-3 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 font-mono select-none">
                      506
                    </div>
                    <input
                      type="text"
                      {...register("cobrosCelular")}
                      onChange={(e) => setValue("cobrosCelular", soloNumeros(e.target.value, 8), { shouldValidate: true })}
                      placeholder="88888888"
                      maxLength={8}
                      className="flex-1 border border-slate-300 bg-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-mercasa-blue transition-all font-mono"
                    />
                  </div>
                  {errors.cobrosCelular && <span className="text-xs text-red-500">{errors.cobrosCelular.message}</span>}
                </div>
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