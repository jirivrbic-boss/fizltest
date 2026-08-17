"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import AnswerReview from "@/components/AnswerReview";
import { useAuth } from "@/context/AuthContext";
import { getUserTestResults, TestResult } from "@/lib/test-results";
import Link from "next/link";
import { Fragment, useEffect, useState } from "react";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function ResultCard({
  result,
  expanded,
  onToggle,
}: {
  result: TestResult;
  expanded: boolean;
  onToggle: () => void;
}) {
  const hasAnswers = result.answers && result.answers.length > 0;

  return (
    <div className="overflow-hidden rounded-2xl bg-slate-800">
      <button
        type="button"
        onClick={onToggle}
        disabled={!hasAnswers}
        className={`w-full p-4 text-left transition ${
          hasAnswers ? "hover:bg-slate-700/50" : "cursor-default"
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-slate-400">
              {formatDate(result.timestamp)}
            </p>
            <p className="mt-1 text-2xl font-bold text-white">
              {result.score} / {result.total}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                result.passed
                  ? "bg-green-600/20 text-green-400"
                  : "bg-red-600/20 text-red-400"
              }`}
            >
              {result.passed ? "Úspěch" : "Neúspěch"}
            </span>
            {hasAnswers && (
              <span className="text-xs text-blue-400">
                {expanded ? "Skrýt odpovědi ▲" : "Zobrazit odpovědi ▼"}
              </span>
            )}
            {!hasAnswers && (
              <span className="text-xs text-slate-500">Detail nedostupný</span>
            )}
          </div>
        </div>
      </button>

      {expanded && hasAnswers && (
        <div className="border-t border-slate-700 p-4">
          <AnswerReview answers={result.answers!} />
        </div>
      )}
    </div>
  );
}

export default function HistoryPage() {
  const { user } = useAuth();
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

  const toggleExpanded = (id: string) => {
    setExpandedId((current) => (current === id ? null : id));
  };

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
            <div className="hidden overflow-hidden rounded-2xl bg-slate-800 sm:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700 text-left text-sm text-slate-400">
                    <th className="px-6 py-4 font-medium">Datum</th>
                    <th className="px-6 py-4 font-medium">Skóre</th>
                    <th className="px-6 py-4 font-medium">Výsledek</th>
                    <th className="px-6 py-4 font-medium">Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result) => {
                    const hasAnswers = result.answers && result.answers.length > 0;
                    const isExpanded = expandedId === result.id;

                    return (
                      <Fragment key={result.id}>
                        <tr className="border-b border-slate-700/50 last:border-0">
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
                          <td className="px-6 py-4">
                            {hasAnswers ? (
                              <button
                                type="button"
                                onClick={() => result.id && toggleExpanded(result.id)}
                                className="text-sm font-medium text-blue-400 transition hover:text-blue-300"
                              >
                                {isExpanded ? "Skrýt" : "Odpovědi"}
                              </button>
                            ) : (
                              <span className="text-sm text-slate-500">—</span>
                            )}
                          </td>
                        </tr>
                        {isExpanded && hasAnswers && (
                          <tr>
                            <td colSpan={4} className="border-b border-slate-700/50 bg-slate-900/50 px-6 py-6">
                              <AnswerReview answers={result.answers!} />
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 sm:hidden">
              {results.map((result) => (
                <ResultCard
                  key={result.id}
                  result={result}
                  expanded={expandedId === result.id}
                  onToggle={() => result.id && toggleExpanded(result.id)}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </ProtectedRoute>
  );
}
