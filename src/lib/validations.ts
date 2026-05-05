import { z } from "zod";

export const proveedorSchema = z.object({
  cedula: z
    .string()
    .min(9, "Mínimo 9 dígitos")
    .max(12, "Máximo 12 dígitos")
    .regex(/^\d+$/, "Solo números"),
  nombreProveedor: z.string().min(1, "Requerido"),
  actEconomicaPrincipal: z.string().min(1, "Requerido"),
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
  emailContacto: z.string().email("Correo electrónico de contacto inválido"),
  nombreContacto: z
    .string()
    .min(1, "Requerido")
    .regex(
      /^\S+\s+\S+\s+\S+$/,
      "Debe incluir Nombre, Primer Apellido y Segundo Apellido"
    ),
  telefono: z
    .string()
    .regex(/^\+506\d{8}$/, "Formato inválido. Use +506 seguido de 8 dígitos"),
  whatsapp: z
    .string()
    .regex(/^\+506\d{8}$/, "Formato inválido. Use +506 seguido de 8 dígitos"),
  actualizar: z.boolean().optional(),
});

export type ProveedorFormData = z.infer<typeof proveedorSchema>;