"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { getAllTests, seedDefaultTestIfEmpty } from "@/lib/tests";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function TestSelectPage() {
  const router = useRouter();
  const [tests, setTests] = useState<Awaited<ReturnType<typeof getAllTests>>>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTests = useCallback(async () => {
    await seedDefaultTestIfEmpty();
    const data = await getAllTests();
    setTests(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadTests();
  }, [loadTests]);

  const toggleTest = (testId: string) => {
    setSelected((prev) =>
      prev.includes(testId) ? prev.filter((id) => id !== testId) : [...prev, testId]
    );
  };

  const totalQuestions = tests
    .filter((t) => selected.includes(t.id))
    .reduce((sum, t) => sum + (t.questionCount ?? 0), 0);

  const handleStart = () => {
    if (selected.length === 0) return;
    const params = new URLSearchParams({ tests: selected.join(",") });
    router.push(`/test?${params.toString()}`);
  };

  return (
    <ProtectedRoute>
      <main className="mx-auto min-h-screen max-w-lg px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white">
            ← Dashboard
          </Link>
          <h1 className="text-lg font-bold text-white">Výběr testů</h1>
          <div className="w-16" />
        </div>

        <p className="mb-6 text-center text-sm text-slate-400">
          Vyberte jeden nebo více testů. Otázky se promíchají — 25 otázek, 20 minut.
        </p>

        {loading ? (
          <div className="py-12 text-center text-slate-400">Načítání testů...</div>
        ) : tests.length === 0 ? (
          <div className="rounded-xl bg-slate-800 p-6 text-center text-slate-400">
            Zatím nejsou k dispozici žádné testy.
          </div>
        ) : (
          <div className="space-y-3">
            {tests.map((test) => {
              const isSelected = selected.includes(test.id);
              return (
                <button
                  key={test.id}
                  onClick={() => toggleTest(test.id)}
                  className={`w-full rounded-xl border-2 p-4 text-left transition ${
                    isSelected
                      ? "border-blue-500 bg-blue-600/20"
                      : "border-slate-700 bg-slate-800 hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">{test.name}</p>
                      {test.description && (
                        <p className="mt-1 text-sm text-slate-400">{test.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500">
                        {test.questionCount ?? 0} otázek
                      </span>
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-md border-2 ${
                          isSelected
                            ? "border-blue-500 bg-blue-500 text-white"
                            : "border-slate-600"
                        }`}
                      >
                        {isSelected && "✓"}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {selected.length > 0 && (
          <p className={`mt-4 text-center text-sm ${totalQuestions < 25 ? "text-amber-400" : "text-slate-400"}`}>
            {totalQuestions < 25
              ? `Vyber ještě alespoň ${25 - totalQuestions} otázek, test musí mít 25.`
              : `Celkem ${totalQuestions} otázek v poolu · vybere se 25 náhodných`}
          </p>
        )}

        <button
          onClick={handleStart}
          disabled={selected.length === 0 || totalQuestions < 25}
          className="mt-6 w-full rounded-2xl bg-blue-600 py-5 text-lg font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40 active:scale-[0.98]"
        >
          Začít test ({selected.length} {selected.length === 1 ? "test" : "testů"})
        </button>
      </main>
    </ProtectedRoute>
  );
}
