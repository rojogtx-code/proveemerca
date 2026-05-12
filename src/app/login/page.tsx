"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  // Usuarios permitidos (Hardcoded)
  const USUARIOS_PERMITIDOS = [
    { email: "amendez@grupomercasa.com", pass: "amr1230" },
    { email: "informatica@grupomercasa.com", pass: "ec185" },
    { email: "gedi@grupomercasa.com", pass: "as328" },
    { email: "informatica2@grupomercasa.com", pass: "nd521" }
  ];

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const usuario = USUARIOS_PERMITIDOS.find(u => u.email === email && u.pass === password);

    if (usuario) {
      // Simular sesión con una cookie (el middleware la validará)
      document.cookie = "admin_session=true; path=/; max-age=86400; SameSite=Lax";
      router.push("/admin");
      router.refresh();
    } else {
      setError("Credenciales inválidas. Solo personal autorizado.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        
        <div className="bg-mercasa-blue p-8 flex flex-col items-center">
          <div className="relative w-48 h-16 mb-2">
             <Image
                src="/logo.png"
                alt="Logo Mercasa"
                fill
                className="object-contain invert brightness-0"
                priority
              />
          </div>
          <h2 className="text-white text-xl font-bold">Panel Administrativo</h2>
        </div>

        <form onSubmit={handleAuth} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-4 rounded-xl text-center">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@mercasa.com"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-mercasa-blue transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-mercasa-blue transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-mercasa-green text-white py-4 rounded-xl font-bold text-lg hover:bg-mercasa-green-dark shadow-lg shadow-green-900/20 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Iniciando sesión..." : "Ingresar al Panel"}
          </button>
          
          <div className="text-center space-y-4">
            <p className="text-xs text-slate-400 pt-2 border-t border-slate-100">
              Solo personal autorizado de Mercasa.
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}
