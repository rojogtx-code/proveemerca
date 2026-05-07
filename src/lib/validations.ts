import { z } from "zod";

export const proveedorSchema = z.object({
  cedula: z
    .string()
    .min(9, "Mínimo 9 dígitos")
    .max(12, "Máximo 12 dígitos")
    .regex(/^\d+$/, "Solo números"),
  nombreProveedor: z.string().min(1, "Requerido"),
  tipoCedulaNombre: z.string().optional(),
  tipoCedulaId: z.string().optional(),
  actEconomicaPrincipal: z.string().optional(),
  codActividadEconomica: z.string().optional(),
  tieneActividad: z.boolean().optional(),
  plazoPagoDias: z.string().min(1, "Seleccione un plazo de pago"),
  esCliente: z.string().min(1, "Seleccione una opción"),
  provincia: z.string().min(1, "Seleccione una provincia"),
  codigoProvincia: z.string().min(1, "Requerido"),
  canton: z.string().min(1, "Seleccione un cantón"),
  codigoCanton: z.string().min(1, "Requerido"),
  distrito: z.string().min(1, "Seleccione un distrito"),
  codigoDistrito: z.string().min(1, "Requerido"),
  barrio: z.string().min(1, "Seleccione un barrio"),
  codigoBarrio: z.string().min(1, "Requerido"),
  direccionExacta: z
    .string()
    .min(10, "Por favor ingrese una dirección detallada"),
  emailFactura: z.string().email("Correo electrónico de facturación inválido"),
  
  // Agente de Ventas
  ventasNombre: z.string().min(1, "Requerido").regex(
    /^[A-Za-záéíóúÁÉÍÓÚñÑüÜ\s]+$/,
    "Use solo letras"
  ),
  ventasEmail: z.string().email("Correo electrónico inválido"),
  ventasExtTelefono: z.string().optional(),
  ventasTelefono: z.string().regex(/^\d{8}$/, "Debe tener exactamente 8 dígitos"),
  ventasExtCelular: z.string().optional(),
  ventasCelular: z.string().regex(/^\d{8}$/, "Debe tener exactamente 8 dígitos"),

  // Cuentas por Cobrar
  cobrosNombre: z.string().min(1, "Requerido").regex(
    /^[A-Za-záéíóúÁÉÍÓÚñÑüÜ\s]+$/,
    "Use solo letras"
  ),
  cobrosEmail: z.string().email("Correo electrónico inválido"),
  cobrosExtTelefono: z.string().optional(),
  cobrosTelefono: z.union([z.string().regex(/^\d{8}$/, "Debe tener exactamente 8 dígitos"), z.literal(""), z.undefined()]),
  cobrosExtCelular: z.string().optional(),
  cobrosCelular: z.string().regex(/^\d{8}$/, "Debe tener exactamente 8 dígitos"),

  actualizar: z.boolean().optional(),
});

export type ProveedorFormData = z.infer<typeof proveedorSchema>;