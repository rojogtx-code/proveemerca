"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (isRegistering) {
      // Validación alfanumérica de 6 dígitos
      const regex = /^[a-zA-Z0-9]{6}$/;
      if (!regex.test(password)) {
        setError("La contraseña debe ser alfanumérica de exactamente 6 caracteres.");
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess("Registro exitoso. Ya puedes iniciar sesión.");
        setIsRegistering(false);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError("Credenciales inválidas. Verifique su correo y contraseña.");
      } else {
        router.push("/admin");
        router.refresh();
      }
    }
    setLoading(false);
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
          <h2 className="text-white text-xl font-bold">
            {isRegistering ? "Crear Nueva Cuenta" : "Panel Administrativo"}
          </h2>
        </div>

        <form onSubmit={handleAuth} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-4 rounded-xl text-center">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 text-sm p-4 rounded-xl text-center">
              {success}
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
            {loading ? "Procesando..." : isRegistering ? "Registrarse" : "Ingresar al Panel"}
          </button>
          
          <div className="text-center space-y-4">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError("");
                setSuccess("");
              }}
              className="text-sm text-mercasa-blue font-semibold hover:underline"
            >
              {isRegistering ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Regístrate aquí"}
            </button>
            <p className="text-xs text-slate-400 pt-2 border-t border-slate-100">
              Solo personal autorizado de Mercasa.
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}
