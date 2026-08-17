"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { getPublicChallenges, type Challenge } from "@/lib/challenges";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const STATUS_LABELS: Record<string, string> = {
  waiting: "Čeká na hráče",
  countdown: "Odpočet",
  active: "Probíhá",
  finished: "Dokončeno",
};

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const data = await getPublicChallenges();
    setChallenges(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 10_000);
    return () => clearInterval(interval);
  }, [load]);

  return (
    <ProtectedRoute>
      <main className="mx-auto min-h-screen max-w-lg px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white">
            ← Dashboard
          </Link>
          <h1 className="text-lg font-bold text-white">Výzvy</h1>
          <div className="w-16" />
        </div>

        <Link
          href="/challenges/create"
          className="mb-6 flex w-full items-center justify-center rounded-2xl bg-purple-600 py-4 text-lg font-semibold text-white transition hover:bg-purple-500 active:scale-[0.98]"
        >
          🏆 Vytvořit výzvu
        </Link>

        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Veřejné výzvy
        </h2>

        {loading ? (
          <div className="py-12 text-center text-slate-400">Načítání...</div>
        ) : challenges.length === 0 ? (
          <div className="rounded-xl bg-slate-800 p-6 text-center text-slate-400">
            Zatím žádné aktivní výzvy. Vytvořte první!
          </div>
        ) : (
          <div className="space-y-3">
            {challenges.map((c) => {
              const playerCount = Object.keys(c.players).length;
              return (
                <Link
                  key={c.id}
                  href={`/challenges/${c.id}`}
                  className="block rounded-xl border border-slate-700 bg-slate-800 p-4 transition hover:border-purple-500/50 hover:bg-slate-800/80"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">
                        {c.testNames.join(" + ") || "Výzva"}
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        {c.creatorEmail} · Kód: <span className="font-mono text-purple-400">{c.code}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="rounded-full bg-purple-600/20 px-2 py-1 text-xs text-purple-300">
                        {STATUS_LABELS[c.status] ?? c.status}
                      </span>
                      <p className="mt-1 text-sm text-slate-400">
                        {playerCount}/{c.maxPlayers} hráčů
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
