"use client";

import { ACHIEVEMENTS } from "@/lib/gamification";

interface AchievementListProps {
  unlockedIds: string[];
  compact?: boolean;
}

export default function AchievementList({
  unlockedIds,
  compact = false,
}: AchievementListProps) {
  const unlocked = ACHIEVEMENTS.filter((achievement) =>
    unlockedIds.includes(achievement.id)
  );
  const locked = ACHIEVEMENTS.filter(
    (achievement) => !unlockedIds.includes(achievement.id)
  );

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {ACHIEVEMENTS.map((achievement) => {
          const isUnlocked = unlockedIds.includes(achievement.id);
          return (
            <div
              key={achievement.id}
              title={`${achievement.title}: ${achievement.description}`}
              className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${
                isUnlocked
                  ? "bg-amber-500/20 ring-1 ring-amber-500/40"
                  : "bg-slate-800 opacity-40 grayscale"
              }`}
            >
              {achievement.emoji}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {unlocked.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-green-400">
            Odemčené ({unlocked.length})
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {unlocked.map((achievement) => (
              <div
                key={achievement.id}
                className="flex items-start gap-3 rounded-xl bg-green-600/10 p-4 ring-1 ring-green-500/30"
              >
                <span className="text-2xl">{achievement.emoji}</span>
                <div>
                  <p className="font-semibold text-white">{achievement.title}</p>
                  <p className="text-sm text-slate-400">{achievement.description}</p>
                  {achievement.xpReward > 0 && (
                    <p className="mt-1 text-xs text-amber-400">
                      +{achievement.xpReward} XP
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {locked.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Zamčené ({locked.length})
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {locked.map((achievement) => (
              <div
                key={achievement.id}
                className="flex items-start gap-3 rounded-xl bg-slate-800/50 p-4 opacity-60"
              >
                <span className="text-2xl grayscale">{achievement.emoji}</span>
                <div>
                  <p className="font-semibold text-slate-400">{achievement.title}</p>
                  <p className="text-sm text-slate-500">{achievement.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
