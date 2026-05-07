import FormProveedor from "@/components/FormProveedor";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 relative">
      {/* Botón Admin Panel */}
      <div className="absolute top-4 right-4">
        <a
          href="/admin"
          className="bg-white hover:bg-slate-50 text-slate-600 px-4 py-2 rounded-xl text-sm font-semibold transition-all border border-slate-200 shadow-sm flex items-center gap-2 group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-12 transition-transform">
            <rect width="18" height="18" x="3" y="3" rx="2" /><path d="M12 8v8" /><path d="M8 12h8" />
          </svg>
          Panel Administrador
        </a>
      </div>

      <div className="max-w-2xl mx-auto">

        {/* Banner decorativo superior */}
        <div className="w-full h-2 bg-mercasa-blue rounded-t-2xl shadow-sm"></div>

        <div className="bg-white rounded-b-2xl shadow-xl border-x border-b border-slate-200 p-8 md:p-12">

          {/* Logo y encabezado */}
          <div className="flex flex-col items-center mb-10">
            <div className="relative w-48 h-20 mb-6 group transition-transform hover:scale-105">
              <Image
                src="/logo.png"
                alt="Logo Mercasa"
                fill
                className="object-contain"
                priority
              />
            </div>

            <div className="h-1 w-20 bg-mercasa-red mb-6 rounded-full"></div>

            <h1 className="text-3xl font-extrabold text-slate-800 text-center tracking-tight">
              Proveedores
            </h1>
            <h2 className="text-mercasa-blue font-semibold text-sm uppercase tracking-widest mt-2">
              Actualización de Datos
            </h2>
            <p className="text-slate-500 text-center mt-4 max-w-sm">
              Con el fin de mantener nuestra base de datos actualizada, les solicitamos completar el siguiente formulario.
            </p>
          </div>

          <div className="space-y-8">
            <FormProveedor />
          </div>

          {/* Footer discreto */}
          <div className="mt-12 pt-8 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">
              © {new Date().getFullYear()} Mercasa. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}