"use client";

import { useState } from "react";
import { supabaseClient as supabase } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";
import { Mail, Lock, LogIn, Loader2, Package } from "lucide-react";

export default function LoginEstoque() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        if (signInError.message === "Invalid login credentials") {
          throw new Error("E-mail ou senha incorretos.");
        }
        throw signInError;
      }

      // Sucesso! Atualiza a página e vai para o Dashboard
      router.refresh();
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro ao fazer login.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        {/* CABEÇALHO DO LOGIN */}
        <div className="bg-indigo-600 p-6 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <Package size={32} />
          </div>
          <h1 className="text-2xl font-bold">Estoque 3G</h1>
          <p className="text-indigo-100 text-sm mt-1">
            Acesso ao sistema de inventário
          </p>
        </div>

        {/* FORMULÁRIO */}
        <form onSubmit={handleLogin} className="p-8 space-y-5">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-sm rounded-md animate-pulse">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 ml-1">
              E-mail Corporativo
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <Mail size={18} />
              </span>
              <input
                type="email"
                required
                placeholder="seu@email.com"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-gray-800"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 ml-1">
              Senha
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <Lock size={18} />
              </span>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-gray-800"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 active:transform active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-2 mt-4">
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <LogIn size={20} />
                Entrar no Estoque
              </>
            )}
          </button>

          <div className="text-center pt-4 mt-2">
            <p className="text-xs text-gray-400">
              * Utilize as mesmas credenciais do GEDOC.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
