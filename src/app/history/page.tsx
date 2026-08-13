"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { getUserTestResults, TestResult } from "@/lib/test-results";
import Link from "next/link";
import { useEffect, useState } from "react";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function HistoryPage() {
  const { user } = useAuth();
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    const fetchResults = async () => {
      try {
        const data = await getUserTestResults(user.uid);
        setResults(data);
      } catch (err) {
        console.error(err);
        setError("Nepodařilo se načíst historii testů.");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [user]);

  return (
    <ProtectedRoute>
      <main className="mx-auto min-h-screen max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-8 flex items-center gap-4">
          <Link
            href="/dashboard"
            className="rounded-xl border border-slate-600 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            ← Zpět
          </Link>
          <h1 className="text-xl font-bold text-white sm:text-2xl">
            Minulé testy
          </h1>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-red-500/10 px-4 py-3 text-red-400">
            {error}
          </div>
        )}

        {!loading && !error && results.length === 0 && (
          <div className="rounded-2xl bg-slate-800 p-8 text-center">
            <p className="text-slate-400">Zatím nemáte žádné dokončené testy.</p>
            <Link
              href="/test"
              className="mt-4 inline-block rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-500"
            >
              Začít první test
            </Link>
          </div>
        )}

        {!loading && results.length > 0 && (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-hidden rounded-2xl bg-slate-800 sm:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700 text-left text-sm text-slate-400">
                    <th className="px-6 py-4 font-medium">Datum</th>
                    <th className="px-6 py-4 font-medium">Skóre</th>
                    <th className="px-6 py-4 font-medium">Výsledek</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result) => (
                    <tr
                      key={result.id}
                      className="border-b border-slate-700/50 last:border-0"
                    >
                      <td className="px-6 py-4 text-white">
                        {formatDate(result.timestamp)}
                      </td>
                      <td className="px-6 py-4 font-semibold text-white">
                        {result.score} / {result.total}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                            result.passed
                              ? "bg-green-600/20 text-green-400"
                              : "bg-red-600/20 text-red-400"
                          }`}
                        >
                          {result.passed ? "Úspěch" : "Neúspěch"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="space-y-3 sm:hidden">
              {results.map((result) => (
                <div
                  key={result.id}
                  className="rounded-2xl bg-slate-800 p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-400">
                      {formatDate(result.timestamp)}
                    </p>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        result.passed
                          ? "bg-green-600/20 text-green-400"
                          : "bg-red-600/20 text-red-400"
                      }`}
                    >
                      {result.passed ? "Úspěch" : "Neúspěch"}
                    </span>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-white">
                    {result.score} / {result.total}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </ProtectedRoute>
  );
}
