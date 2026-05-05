import sanJose from "./san-jose.json";
import alajuela from "./alajuela.json";
import cartago from "./cartago.json";
import heredia from "./heredia.json";
import guanacaste from "./guanacaste.json";
import puntarenas from "./puntarenas.json";
import limon from "./limon.json";

export const provincias = [
  sanJose,
  alajuela,
  cartago,
  heredia,
  guanacaste,
  puntarenas,
  limon,
];

// Tipos
export type Barrio = {
  nombre: string;
  codigo_barrio: string;
};

export type Distrito = {
  distrito: string;
  codigo_distrito: string;
  barrios: Barrio[];
};

export type Canton = {
  canton: string;
  codigo_canton: string;
  distritos: Distrito[];
};

export type Provincia = {
  provincia: string;
  codigo_provincia: string;
  cantones: Canton[];
};