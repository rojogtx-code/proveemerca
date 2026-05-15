import { z } from "zod";

const phoneRegex = /^\d{8}$/;
const nameRegex = /^[A-Za-záéíóúÁÉÍÓÚñÑüÜ\s]+$/;
const optionalPhone = z.union([
  z.string().regex(phoneRegex, "Debe tener exactamente 8 dígitos"),
  z.literal(""),
  z.undefined(),
]);

export const proveedorSchema = z
  .object({
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
    monedaCredito: z.string().optional(),
    montoCredito: z.string().optional(),
    provincia: z.string().min(1, "Seleccione una provincia"),
    codigoProvincia: z.string().min(1, "Requerido"),
    canton: z.string().min(1, "Seleccione un cantón"),
    codigoCanton: z.string().min(1, "Requerido"),
    distrito: z.string().min(1, "Seleccione un distrito"),
    codigoDistrito: z.string().min(1, "Requerido"),
    barrio: z.string().min(1, "Seleccione un barrio"),
    codigoBarrio: z.string().min(1, "Requerido"),
    direccionExacta: z.string().min(10, "Por favor ingrese una dirección detallada"),
    emailFactura: z.string().optional(),
    correoComprobantes: z.string().email("Correo de comprobantes inválido"),

    // ── Cuentas Bancarias ────────────────────────────────────────────────
    cuentas: z.array(z.object({
      banco: z.string().min(1, "Seleccione un banco"),
      otroBanco: z.string().optional(),
      moneda: z.string().min(1, "Seleccione moneda"),
      iban: z.string().length(20, "Debe tener exactamente 20 dígitos"),
      cuentaCorriente: z.string().max(25, "Máximo 25 caracteres").regex(/^\d+$/, "Solo números"),
    })).min(1, "Debe agregar al menos una cuenta bancaria"),

    // ── Agente de Ventas (siempre requerido) ──────────────────────────────
    ventasNombre: z
      .string()
      .min(8, "Debe tener al menos 8 caracteres")
      .regex(nameRegex, "Use solo letras"),
    ventasEmail: z.string().email("Correo electrónico inválido"),
    ventasTelefono: z.string().regex(phoneRegex, "Debe tener exactamente 8 dígitos"),
    ventasWhatsApp: optionalPhone,

    // ── Facturador (condicional) ───────────────────────────────────────────
    tieneFacturador: z.boolean(),
    facturadorNombre: z.string().optional(),
    facturadorEmail: z.string().optional(),
    facturadorTelefono: z.string().optional(),
    facturadorWhatsApp: optionalPhone,

    // ── Cuentas por Cobrar (condicional) ──────────────────────────────────
    tieneCobros: z.boolean(),
    cobrosNombre: z.string().optional(),
    cobrosEmail: z.string().optional(),
    cobrosTelefono: z.string().optional(),
    cobrosWhatsApp: optionalPhone,
  })
  .superRefine((data, ctx) => {
    // Validación condicional: Cuentas Bancarias
    data.cuentas.forEach((cuenta, index) => {
      if (cuenta.banco === "Otros" && (!cuenta.otroBanco || cuenta.otroBanco.trim().length < 2)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Escriba el nombre del banco",
          path: ["cuentas", index, "otroBanco"],
        });
      }
    });

    // Validación condicional: Email Factura (solo si es cliente)
    if (data.esCliente === "Si") {
      if (!data.emailFactura || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.emailFactura)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Correo electrónico de facturación inválido",
          path: ["emailFactura"],
        });
      }
    }

    // Validación condicional: Facturador
    if (data.tieneFacturador) {
      if (!data.facturadorNombre || data.facturadorNombre.trim().length < 8) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Debe tener al menos 8 caracteres", path: ["facturadorNombre"] });
      } else if (!nameRegex.test(data.facturadorNombre)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Use solo letras", path: ["facturadorNombre"] });
      }
      if (!data.facturadorEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.facturadorEmail)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Correo electrónico inválido", path: ["facturadorEmail"] });
      }
      if (!data.facturadorTelefono || !phoneRegex.test(data.facturadorTelefono)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Debe tener exactamente 8 dígitos", path: ["facturadorTelefono"] });
      }
    }

    // Validación condicional: Cobros
    if (data.tieneCobros) {
      if (!data.cobrosNombre || data.cobrosNombre.trim().length < 8) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Debe tener al menos 8 caracteres", path: ["cobrosNombre"] });
      } else if (!nameRegex.test(data.cobrosNombre)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Use solo letras", path: ["cobrosNombre"] });
      }
      if (!data.cobrosEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.cobrosEmail)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Correo electrónico inválido", path: ["cobrosEmail"] });
      }
      if (!data.cobrosTelefono || !phoneRegex.test(data.cobrosTelefono)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Debe tener exactamente 8 dígitos", path: ["cobrosTelefono"] });
      }
    }
  });

export type ProveedorFormData = z.infer<typeof proveedorSchema>;