"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace("/");
  };

  return (
    <ProtectedRoute>
      <main className="mx-auto min-h-screen max-w-lg px-4 py-8 sm:py-12">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-lg font-bold text-white">
            PČR
          </div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Vítejte
          </h1>
          <p className="mt-2 text-slate-400">
            {user?.email}
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/test"
            className="flex w-full items-center justify-center rounded-2xl bg-blue-600 py-5 text-lg font-semibold text-white shadow-lg transition hover:bg-blue-500 active:scale-[0.98]"
          >
            Začít test
          </Link>

          <Link
            href="/history"
            className="flex w-full items-center justify-center rounded-2xl bg-slate-700 py-5 text-lg font-semibold text-white shadow-lg transition hover:bg-slate-600 active:scale-[0.98]"
          >
            Minulé testy
          </Link>

          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center rounded-2xl border-2 border-slate-600 py-5 text-lg font-semibold text-slate-300 transition hover:border-slate-500 hover:text-white active:scale-[0.98]"
          >
            Odhlásit
          </button>
        </div>

        <div className="mt-10 rounded-xl bg-slate-800/50 p-4 text-center text-sm text-slate-500">
          <p>25 otázek · 20 minut · úspěch od 23 bodů</p>
        </div>
      </main>
    </ProtectedRoute>
  );
}
