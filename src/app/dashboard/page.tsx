"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import AchievementList from "@/components/AchievementList";
import UnclaimedRewards from "@/components/UnclaimedRewards";
import XpProgressBar from "@/components/XpProgressBar";
import { useAuth } from "@/context/AuthContext";
import {
  XP_ANIMATION_KEY,
  getUnclaimedLevels,
  type XpAnimationPayload,
} from "@/lib/gamification";
import { getUserProgress } from "@/lib/user-progress";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [totalXp, setTotalXp] = useState(0);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [claimedLevelRewards, setClaimedLevelRewards] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [xpAnimation, setXpAnimation] = useState<XpAnimationPayload | null>(null);

  const loadProgress = useCallback(async () => {
    if (!user) return;

    const progress = await getUserProgress(user.uid);
    setTotalXp(progress.totalXp);
    setUnlockedAchievements(progress.unlockedAchievements);
    setClaimedLevelRewards(progress.claimedLevelRewards);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  useEffect(() => {
    const raw = sessionStorage.getItem(XP_ANIMATION_KEY);
    if (!raw) return;

    sessionStorage.removeItem(XP_ANIMATION_KEY);
    try {
      const payload = JSON.parse(raw) as XpAnimationPayload;
      if (payload.earnedXp > 0) {
        setXpAnimation(payload);
      }
    } catch {
      // ignore invalid payload
    }
  }, []);

  const handleLogout = async () => {
    await logout();
    router.replace("/");
  };

  const unclaimedLevels = getUnclaimedLevels(totalXp, claimedLevelRewards);

  return (
    <ProtectedRoute>
      <main className="mx-auto min-h-screen max-w-lg px-4 py-8 sm:py-12">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-lg font-bold text-white">
            PČR
          </div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Vítejte
          </h1>
          <p className="mt-2 text-slate-400">{user?.email}</p>
        </div>

        {!loading && (
          <div className="mb-6 space-y-4">
            <XpProgressBar
              totalXp={totalXp}
              animateFromXp={xpAnimation?.previousXp}
              earnedXp={xpAnimation?.earnedXp}
            />
            <UnclaimedRewards
              levels={unclaimedLevels}
              userId={user!.uid}
              onClaimed={loadProgress}
            />
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-400">Achievementy</p>
                <Link
                  href="/achievements"
                  className="text-xs font-medium text-blue-400 hover:text-blue-300"
                >
                  Zobrazit vše →
                </Link>
              </div>
              <AchievementList unlockedIds={unlockedAchievements} compact />
            </div>
          </div>
        )}

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
          <p className="mt-1">+10 XP za správnou odpověď · +150 XP za splněný test</p>
        </div>
      </main>
    </ProtectedRoute>
  );
}
