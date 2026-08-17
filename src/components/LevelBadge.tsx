"use client";

import { LevelDefinition } from "@/lib/gamification";

interface LevelBadgeProps {
  level: LevelDefinition;
  size?: "sm" | "md" | "lg";
  showLevel?: boolean;
  dimmed?: boolean;
}

const sizeClasses = {
  sm: "h-10 w-10 text-base",
  md: "h-14 w-14 text-2xl",
  lg: "h-20 w-20 text-4xl",
};

export default function LevelBadge({
  level,
  size = "md",
  showLevel = false,
  dimmed = false,
}: LevelBadgeProps) {
  return (
    <div className={`relative shrink-0 ${dimmed ? "opacity-40 grayscale" : ""}`}>
      <div
        className={`flex items-center justify-center rounded-full bg-gradient-to-br ${level.gradient} shadow-lg ring-2 ring-white/10 ${sizeClasses[size]}`}
      >
        <span>{level.rewardEmoji}</span>
      </div>
      {showLevel && (
        <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white ring-1 ring-slate-600">
          {level.level}
        </span>
      )}
    </div>
  );
}
