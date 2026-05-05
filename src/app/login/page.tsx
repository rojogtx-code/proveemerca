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
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Credenciales inválidas. Verifique su correo y contraseña.");
      setLoading(false);
    } else {
      router.push("/admin");
      router.refresh();
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        
        <div className="bg-mercasa-blue p-8 flex flex-col items-center">
          <div className="relative w-32 h-12 mb-2 invert brightness-0">
             <Image
                src="/logo.png"
                alt="Logo Mercasa"
                fill
                className="object-contain"
                priority
              />
          </div>
          <h2 className="text-white text-xl font-bold">Panel Administrativo</h2>
        </div>

        <form onSubmit={handleLogin} className="p-8 space-y-6">
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
            className="w-full bg-mercasa-red text-white py-4 rounded-xl font-bold text-lg hover:bg-mercasa-red-dark shadow-lg shadow-red-900/20 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Iniciando sesión..." : "Ingresar al Panel"}
          </button>
          
          <div className="text-center">
            <p className="text-xs text-slate-400">
              Solo personal autorizado de Mercasa.
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}
