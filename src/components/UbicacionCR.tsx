"use client";

import { useEffect, useState } from "react";
import { UseFormSetValue, UseFormRegister, FieldErrors } from "react-hook-form";
import { provincias, Canton, Distrito, Barrio } from "@/data/ubicacion";
import { ProveedorFormData } from "@/lib/validations";

type Props = {
  register: UseFormRegister<ProveedorFormData>;
  setValue: UseFormSetValue<ProveedorFormData>;
  errors: FieldErrors<ProveedorFormData>;
};

export default function UbicacionCR({ register, setValue, errors }: Props) {
  const [cantones, setCantones] = useState<Canton[]>([]);
  const [distritos, setDistritos] = useState<Distrito[]>([]);
  const [barrios, setBarrios] = useState<Barrio[]>([]);

  function handleProvincia(e: React.ChangeEvent<HTMLSelectElement>) {
    const selected = provincias.find((p) => p.provincia === e.target.value);
    setValue("provincia", selected?.provincia ?? "");
    setValue("codigoProvincia", selected?.codigo_provincia ?? "");
    setValue("canton", "");
    setValue("codigoCanton", "");
    setValue("distrito", "");
    setValue("codigoDistrito", "");
    setValue("barrio", "");
    setValue("codigoBarrio", "");
    setCantones(selected?.cantones ?? []);
    setDistritos([]);
    setBarrios([]);
  }

  function handleCanton(e: React.ChangeEvent<HTMLSelectElement>) {
    const selected = cantones.find((c) => c.canton === e.target.value);
    setValue("canton", selected?.canton ?? "");
    setValue("codigoCanton", selected?.codigo_canton ?? "");
    setValue("distrito", "");
    setValue("codigoDistrito", "");
    setValue("barrio", "");
    setValue("codigoBarrio", "");
    setDistritos(selected?.distritos ?? []);
    setBarrios([]);
  }

  function handleDistrito(e: React.ChangeEvent<HTMLSelectElement>) {
    const selected = distritos.find((d) => d.distrito === e.target.value);
    setValue("distrito", selected?.distrito ?? "");
    setValue("codigoDistrito", selected?.codigo_distrito ?? "");
    setValue("barrio", "");
    setValue("codigoBarrio", "");
    setBarrios(selected?.barrios ?? []);
  }

  function handleBarrio(e: React.ChangeEvent<HTMLSelectElement>) {
    const selected = barrios.find((b) => b.nombre === e.target.value);
    setValue("barrio", selected?.nombre ?? "");
    setValue("codigoBarrio", selected?.codigo_barrio ?? "");
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Provincia */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Provincia</label>
        <select
          onChange={handleProvincia}
          className="border border-slate-300 bg-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-mercasa-blue transition-all appearance-none"
        >
          <option value="">Seleccione una provincia</option>
          {provincias.map((p) => (
            <option key={p.codigo_provincia} value={p.provincia}>
              {p.provincia}
            </option>
          ))}
        </select>
        {errors.provincia && (
          <span className="text-xs text-red-500">{errors.provincia.message}</span>
        )}
      </div>

      {/* Cantón */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Cantón</label>
        <select
          onChange={handleCanton}
          disabled={cantones.length === 0}
          className="border border-slate-300 bg-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-mercasa-blue transition-all appearance-none disabled:opacity-40 disabled:bg-slate-100 cursor-pointer disabled:cursor-not-allowed"
        >
          <option value="">Seleccione un cantón</option>
          {cantones.map((c) => (
            <option key={c.codigo_canton} value={c.canton}>
              {c.canton}
            </option>
          ))}
        </select>
        {errors.canton && (
          <span className="text-xs text-red-500">{errors.canton.message}</span>
        )}
      </div>

      {/* Distrito */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Distrito</label>
        <select
          onChange={handleDistrito}
          disabled={distritos.length === 0}
          className="border border-slate-300 bg-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-mercasa-blue transition-all appearance-none disabled:opacity-40 disabled:bg-slate-100 cursor-pointer disabled:cursor-not-allowed"
        >
          <option value="">Seleccione un distrito</option>
          {distritos.map((d) => (
            <option key={d.codigo_distrito} value={d.distrito}>
              {d.distrito}
            </option>
          ))}
        </select>
        {errors.distrito && (
          <span className="text-xs text-red-500">{errors.distrito.message}</span>
        )}
      </div>

      {/* Barrio */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Barrio</label>
        <select
          onChange={handleBarrio}
          disabled={barrios.length === 0}
          className="border border-slate-300 bg-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-mercasa-blue transition-all appearance-none disabled:opacity-40 disabled:bg-slate-100 cursor-pointer disabled:cursor-not-allowed"
        >
          <option value="">Seleccione un barrio</option>
          {barrios.map((b) => (
            <option key={b.codigo_barrio} value={b.nombre}>
              {b.nombre}
            </option>
          ))}
        </select>
        {errors.barrio && (
          <span className="text-xs text-red-500">{errors.barrio.message}</span>
        )}
      </div>

      {/* Campos ocultos para registrar códigos */}
      <input type="hidden" {...register("codigoProvincia")} />
      <input type="hidden" {...register("codigoCanton")} />
      <input type="hidden" {...register("codigoDistrito")} />
      <input type="hidden" {...register("codigoBarrio")} />
    </div>
  );
}