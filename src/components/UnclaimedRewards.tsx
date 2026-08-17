"use client";

import { LevelDefinition } from "@/lib/gamification";
import { claimLevelReward } from "@/lib/user-progress";
import { useState } from "react";

interface UnclaimedRewardsProps {
  levels: LevelDefinition[];
  userId: string;
  onClaimed: () => void;
}

export default function UnclaimedRewards({
  levels,
  userId,
  onClaimed,
}: UnclaimedRewardsProps) {
  const [claimingLevel, setClaimingLevel] = useState<number | null>(null);

  if (levels.length === 0) return null;

  const handleClaim = async (level: LevelDefinition) => {
    setClaimingLevel(level.level);
    try {
      await claimLevelReward(userId, level.level);
      onClaimed();
    } catch (error) {
      console.error("Failed to claim reward:", error);
    } finally {
      setClaimingLevel(null);
    }
  };

  return (
    <div className="rounded-2xl bg-amber-500/10 p-4 ring-1 ring-amber-500/30">
      <h3 className="mb-3 font-semibold text-amber-400">
        Nevyzvednuté odměny ({levels.length})
      </h3>
      <div className="space-y-2">
        {levels.map((level) => (
          <div
            key={level.level}
            className="flex items-center justify-between gap-3 rounded-xl bg-slate-800/80 p-3"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{level.rewardEmoji}</span>
              <div>
                <p className="text-sm font-semibold text-white">
                  Level {level.level} · {level.reward}
                </p>
                <p className="text-xs text-slate-400">{level.title}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleClaim(level)}
              disabled={claimingLevel === level.level}
              className="shrink-0 rounded-lg bg-amber-500 px-3 py-2 text-xs font-bold text-slate-900 transition hover:bg-amber-400 disabled:opacity-50"
            >
              {claimingLevel === level.level ? "..." : "Vyzvednout"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
