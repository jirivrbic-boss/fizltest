"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { createChallenge } from "@/lib/challenges";
import { getAllTests, seedDefaultTestIfEmpty } from "@/lib/tests";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function CreateChallengePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tests, setTests] = useState<Awaited<ReturnType<typeof getAllTests>>>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const loadTests = useCallback(async () => {
    await seedDefaultTestIfEmpty();
    setTests(await getAllTests());
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

  const handleCreate = async () => {
    if (!user?.email || selected.length === 0 || totalQuestions < 25) return;
    setCreating(true);
    setError("");

    try {
      const testNames = tests.filter((t) => selected.includes(t.id)).map((t) => t.name);
      const id = await createChallenge(
        user.uid,
        user.email,
        maxPlayers,
        selected,
        testNames
      );
      router.push(`/challenges/${id}`);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Výzvu se nepodařilo vytvořit");
      setCreating(false);
    }
  };

  const totalQuestions = tests
    .filter((test) => selected.includes(test.id))
    .reduce((sum, test) => sum + (test.questionCount ?? 0), 0);

  return (
    <ProtectedRoute>
      <main className="mx-auto min-h-screen max-w-lg px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/challenges" className="text-sm text-slate-400 hover:text-white">
            ← Výzvy
          </Link>
          <h1 className="text-lg font-bold text-white">Nová výzva</h1>
          <div className="w-16" />
        </div>

        <div className="mb-6">
          <label className="mb-2 block text-sm font-semibold text-slate-400">
            Počet hráčů
          </label>
          <div className="flex gap-2">
            {[2, 3, 4, 5, 6, 8].map((n) => (
              <button
                key={n}
                onClick={() => setMaxPlayers(n)}
                className={`flex-1 rounded-xl py-3 text-sm font-semibold transition ${
                  maxPlayers === n
                    ? "bg-purple-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="mb-2 block text-sm font-semibold text-slate-400">
            Témata testů
          </label>
          {loading ? (
            <p className="text-slate-500">Načítání...</p>
          ) : (
            <div className="space-y-2">
              {tests.map((test) => {
                const isSelected = selected.includes(test.id);
                return (
                  <button
                    key={test.id}
                    onClick={() => toggleTest(test.id)}
                    className={`w-full rounded-xl border-2 p-3 text-left transition ${
                      isSelected
                        ? "border-purple-500 bg-purple-600/20"
                        : "border-slate-700 bg-slate-800"
                    }`}
                  >
                    <p className="font-semibold text-white">{test.name}</p>
                    <p className="text-xs text-slate-400">{test.questionCount ?? 0} otázek</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {selected.length > 0 && totalQuestions < 25 && (
          <p className="mb-4 rounded-xl bg-amber-500/10 p-3 text-center text-sm text-amber-300">
            Vybraná témata mají {totalQuestions} otázek. Pro výzvu je potřeba alespoň 25.
          </p>
        )}

        {error && (
          <p className="mb-4 rounded-xl bg-red-600/15 p-3 text-center text-sm text-red-300">
            {error}
          </p>
        )}

        <button
          onClick={handleCreate}
          disabled={creating || selected.length === 0 || totalQuestions < 25}
          className="w-full rounded-2xl bg-purple-600 py-5 text-lg font-semibold text-white transition hover:bg-purple-500 disabled:opacity-40 active:scale-[0.98]"
        >
          {creating ? "Vytváření..." : "Vytvořit a čekat v roomce"}
        </button>
      </main>
    </ProtectedRoute>
  );
}
