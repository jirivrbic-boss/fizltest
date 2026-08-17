"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import LevelBadge from "@/components/LevelBadge";
import XpProgressBar from "@/components/XpProgressBar";
import {
  LEVELS,
  MAX_LEVEL,
  getLevelFromXp,
  getLevelStatus,
  getUnclaimedLevels,
} from "@/lib/gamification";
import { claimLevelReward, getUserProgress } from "@/lib/user-progress";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function RewardsPage() {
  const { user } = useAuth();
  const [totalXp, setTotalXp] = useState(0);
  const [claimedLevelRewards, setClaimedLevelRewards] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingLevel, setClaimingLevel] = useState<number | null>(null);

  const loadProgress = useCallback(async () => {
    if (!user) return;
    const progress = await getUserProgress(user.uid);
    setTotalXp(progress.totalXp);
    setClaimedLevelRewards(progress.claimedLevelRewards);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  const currentLevel = getLevelFromXp(totalXp);
  const unclaimedCount = getUnclaimedLevels(totalXp, claimedLevelRewards).length;

  const handleClaim = async (level: number) => {
    if (!user) return;
    setClaimingLevel(level);
    try {
      await claimLevelReward(user.uid, level);
      await loadProgress();
    } catch (error) {
      console.error("Failed to claim reward:", error);
    } finally {
      setClaimingLevel(null);
    }
  };

  return (
    <ProtectedRoute>
      <main className="mx-auto min-h-screen max-w-lg px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-blue-400 hover:text-blue-300"
          >
            ← Dashboard
          </Link>
          <span className="text-xs text-slate-500">
            {currentLevel} / {MAX_LEVEL}
          </span>
        </div>

        <h1 className="mb-2 text-2xl font-bold text-white">Odměny & odznaky</h1>
        <p className="mb-6 text-sm text-slate-400">
          {unclaimedCount > 0
            ? `Máš ${unclaimedCount} nevyzvednutých odměn!`
            : "Splň testy, získávej XP a odemykej nové odznaky."}
        </p>

        {!loading && <XpProgressBar totalXp={totalXp} showRewardsLink={false} />}

        <div className="mt-6 space-y-3">
          {LEVELS.map((level) => {
            const status = getLevelStatus(level.level, totalXp, claimedLevelRewards);

            return (
              <div
                key={level.level}
                className={`rounded-xl p-4 transition ${
                  status === "unclaimed"
                    ? "bg-amber-500/10 ring-1 ring-amber-500/40"
                    : status === "claimed"
                      ? "bg-slate-800/60 ring-1 ring-green-500/20"
                      : "bg-slate-800/30 ring-1 ring-slate-700/50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <LevelBadge
                    level={level}
                    size="sm"
                    showLevel
                    dimmed={status === "locked"}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-white">
                        Level {level.level} · {level.title}
                      </p>
                      {status === "claimed" && (
                        <span className="rounded bg-green-600/20 px-1.5 py-0.5 text-[10px] font-bold text-green-400">
                          VYBRÁNO
                        </span>
                      )}
                      {status === "locked" && (
                        <span className="rounded bg-slate-700 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
                          🔒
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-slate-400">{level.reward}</p>
                    <p className="mt-1 text-xs italic leading-relaxed text-slate-500">
                      &ldquo;{level.message}&rdquo;
                    </p>
                    <p className="mt-1 text-[10px] text-slate-600">
                      {level.xpRequired.toLocaleString("cs-CZ")} XP
                    </p>
                  </div>

                  {status === "unclaimed" && (
                    <button
                      type="button"
                      onClick={() => handleClaim(level.level)}
                      disabled={claimingLevel === level.level}
                      className="shrink-0 rounded-lg bg-amber-500 px-3 py-2 text-xs font-bold text-slate-900 transition hover:bg-amber-400 disabled:opacity-50"
                    >
                      {claimingLevel === level.level ? "..." : "Vyzvednout"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </ProtectedRoute>
  );
}
