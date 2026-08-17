"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import AchievementList from "@/components/AchievementList";
import XpProgressBar from "@/components/XpProgressBar";
import { useAuth } from "@/context/AuthContext";
import { getUserProgress } from "@/lib/user-progress";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AchievementsPage() {
  const { user } = useAuth();
  const [totalXp, setTotalXp] = useState(0);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    getUserProgress(user.uid)
      .then((progress) => {
        setTotalXp(progress.totalXp);
        setUnlockedAchievements(progress.unlockedAchievements);
      })
      .finally(() => setLoading(false));
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
            Achievementy
          </h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          </div>
        ) : (
          <div className="space-y-6">
            <XpProgressBar totalXp={totalXp} />
            <AchievementList unlockedIds={unlockedAchievements} />
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
