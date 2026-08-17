"use client";

import { LevelDefinition } from "@/lib/gamification";
import { claimLevelReward } from "@/lib/user-progress";
import { useEffect, useState } from "react";

interface LevelUpModalProps {
  level: LevelDefinition;
  userId: string;
  onClose: () => void;
}

function Confetti() {
  const particles = Array.from({ length: 24 }, (_, index) => ({
    id: index,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 0.5}s`,
    color: ["#3b82f6", "#22d3ee", "#fbbf24", "#a855f7", "#34d399"][
      index % 5
    ],
  }));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((particle) => (
        <span
          key={particle.id}
          className="confetti-particle absolute top-0 h-2 w-2 rounded-sm"
          style={{
            left: particle.left,
            backgroundColor: particle.color,
            animationDelay: particle.delay,
          }}
        />
      ))}
    </div>
  );
}

export default function LevelUpModal({ level, userId, onClose }: LevelUpModalProps) {
  const [phase, setPhase] = useState<"celebrate" | "claim" | "claimed">("celebrate");
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setPhase("claim"), 1800);
    return () => clearTimeout(timer);
  }, []);

  const handleClaim = async () => {
    setClaiming(true);
    try {
      await claimLevelReward(userId, level.level);
      setPhase("claimed");
      setTimeout(onClose, 1200);
    } catch (error) {
      console.error("Failed to claim reward:", error);
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="level-up-modal relative w-full max-w-sm overflow-hidden rounded-3xl bg-slate-900 p-8 text-center shadow-2xl ring-1 ring-white/10">
        <Confetti />

        <div className={`level-up-badge mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br ${level.gradient} text-5xl shadow-2xl`}>
          {level.rewardEmoji}
        </div>

        <p className="level-up-text mb-2 text-sm font-semibold uppercase tracking-widest text-blue-400">
          Level Up!
        </p>
        <h2 className="level-up-text mb-1 text-3xl font-bold text-white">
          Level {level.level}
        </h2>
        <p className="level-up-text mb-4 text-lg text-slate-300">{level.title}</p>

        <p className="level-up-message mb-6 text-sm leading-relaxed text-slate-400">
          {level.message}
        </p>

        {phase === "celebrate" && (
          <div className="animate-pulse rounded-xl bg-slate-800 px-4 py-3 text-sm text-slate-300">
            Gratulujeme k postupu!
          </div>
        )}

        {phase === "claim" && (
          <div className="space-y-3">
            <div className="rounded-xl bg-slate-800/80 px-4 py-3">
              <p className="text-xs text-slate-500">Odměna k vyzvednutí</p>
              <p className="mt-1 font-semibold text-white">
                {level.rewardEmoji} {level.reward}
              </p>
            </div>
            <button
              type="button"
              onClick={handleClaim}
              disabled={claiming}
              className={`w-full rounded-xl bg-gradient-to-r ${level.gradient} py-4 text-base font-bold text-white transition hover:opacity-90 active:scale-[0.98] disabled:opacity-50`}
            >
              {claiming ? "Vyzvedávám..." : "Vyzvednout odměnu"}
            </button>
          </div>
        )}

        {phase === "claimed" && (
          <div className="reward-claimed rounded-xl bg-green-600/20 px-4 py-4 ring-1 ring-green-500/50">
            <p className="text-2xl">🎉</p>
            <p className="mt-2 font-semibold text-green-400">Odměna vyzvednuta!</p>
          </div>
        )}
      </div>
    </div>
  );
}
