"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function AuthForm() {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Došlo k neočekávané chybě.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-bold text-white shadow-lg">
          PČR
        </div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">
          Fizl Testy
        </h1>
        <p className="mt-2 text-slate-400">
          Příprava na služební testy
        </p>
      </div>

      <div className="rounded-2xl bg-slate-800 p-6 shadow-xl sm:p-8">
        <div className="mb-6 flex rounded-xl bg-slate-700 p-1">
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setError("");
            }}
            className={`flex-1 rounded-lg py-3 text-sm font-semibold transition-all ${
              isLogin
                ? "bg-blue-600 text-white shadow-md"
                : "text-slate-300 hover:text-white"
            }`}
          >
            Přihlášení
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              setError("");
            }}
            className={`flex-1 rounded-lg py-3 text-sm font-semibold transition-all ${
              !isLogin
                ? "bg-blue-600 text-white shadow-md"
                : "text-slate-300 hover:text-white"
            }`}
          >
            Registrace
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-300">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-600 bg-slate-700 px-4 py-3.5 text-white placeholder-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
              placeholder="vas@email.cz"
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-300">
              Heslo
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-600 bg-slate-700 px-4 py-3.5 text-white placeholder-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
              placeholder="••••••••"
              autoComplete={isLogin ? "current-password" : "new-password"}
            />
          </div>

          {error && (
            <div className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-4 text-base font-semibold text-white transition hover:bg-blue-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Načítání..." : isLogin ? "Přihlásit se" : "Registrovat se"}
          </button>
        </form>
      </div>
    </div>
  );
}
