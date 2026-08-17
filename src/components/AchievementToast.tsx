"use client";

import { AchievementDefinition } from "@/lib/gamification";
import { useEffect } from "react";

interface AchievementToastProps {
  achievements: AchievementDefinition[];
  onDone: () => void;
}

export default function AchievementToast({
  achievements,
  onDone,
}: AchievementToastProps) {
  useEffect(() => {
    if (achievements.length === 0) return;
    const timer = setTimeout(onDone, 4000);
    return () => clearTimeout(timer);
  }, [achievements, onDone]);

  if (achievements.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-50 w-full max-w-sm -translate-x-1/2 px-4">
      <div className="achievement-toast space-y-2">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className="flex items-center gap-3 rounded-2xl bg-slate-800 p-4 shadow-2xl ring-1 ring-amber-500/40"
          >
            <span className="achievement-pop text-3xl">{achievement.emoji}</span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-400">
                Nový achievement!
              </p>
              <p className="font-bold text-white">{achievement.title}</p>
              {achievement.xpReward > 0 && (
                <p className="text-xs text-slate-400">+{achievement.xpReward} XP</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
