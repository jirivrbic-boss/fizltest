"use client";

import { getLevelProgress } from "@/lib/gamification";

interface XpProgressBarProps {
  totalXp: number;
  compact?: boolean;
}

export default function XpProgressBar({ totalXp, compact = false }: XpProgressBarProps) {
  const { current, next, progress, xpInLevel, xpNeeded, currentLevel } =
    getLevelProgress(totalXp);

  if (compact) {
    return (
      <div className="w-full">
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="font-semibold text-white">
            Lvl {currentLevel} · {current.title}
          </span>
          <span className="text-slate-400">{totalXp} XP</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-700">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-slate-800 p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${current.gradient} text-lg font-bold text-white shadow-lg`}
          >
            {currentLevel}
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Level {currentLevel}
            </p>
            <p className="font-bold text-white">{current.title}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-blue-400">{totalXp}</p>
          <p className="text-xs text-slate-500">XP celkem</p>
        </div>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-slate-700">
        <div
          className="xp-bar-fill h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-2 flex justify-between text-xs text-slate-400">
        {next ? (
          <>
            <span>
              {xpInLevel} / {xpNeeded} XP
            </span>
            <span>
              Další: Lvl {next.level} · {next.title}
            </span>
          </>
        ) : (
          <span className="text-amber-400">Maximální level dosažen!</span>
        )}
      </div>
    </div>
  );
}
