"use client";

import { getLevelProgress } from "@/lib/gamification";
import LevelBadge from "@/components/LevelBadge";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface XpProgressBarProps {
  totalXp: number;
  animateFromXp?: number;
  earnedXp?: number;
  compact?: boolean;
  showRewardsLink?: boolean;
}

function useAnimatedValue(
  target: number,
  from: number | undefined,
  duration = 2000
): number {
  const [value, setValue] = useState(from ?? target);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (from === undefined || from === target) {
      setValue(target);
      return;
    }

    const start = performance.now();
    const delta = target - from;

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(from + delta * eased));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    setValue(from);
    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target, from, duration]);

  return value;
}

export default function XpProgressBar({
  totalXp,
  animateFromXp,
  earnedXp,
  compact = false,
  showRewardsLink = true,
}: XpProgressBarProps) {
  const isAnimating = animateFromXp !== undefined && animateFromXp !== totalXp;
  const displayXp = useAnimatedValue(totalXp, isAnimating ? animateFromXp : undefined);
  const [showEarnedPopup, setShowEarnedPopup] = useState(false);

  const { current, next, progress, xpInLevel, xpNeeded, currentLevel } =
    getLevelProgress(displayXp);

  const previousProgress = isAnimating
    ? getLevelProgress(animateFromXp!).progress
    : progress;

  const [barProgress, setBarProgress] = useState(previousProgress);

  useEffect(() => {
    if (!isAnimating) {
      setBarProgress(progress);
      return;
    }

    setBarProgress(previousProgress);
    const timer = setTimeout(() => setBarProgress(progress), 80);
    return () => clearTimeout(timer);
  }, [isAnimating, progress, previousProgress]);

  useEffect(() => {
    if (isAnimating && earnedXp && earnedXp > 0) {
      setShowEarnedPopup(true);
      const timer = setTimeout(() => setShowEarnedPopup(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isAnimating, earnedXp]);

  if (compact) {
    return (
      <div className="w-full">
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="font-semibold text-white">
            Lvl {currentLevel} · {current.title}
          </span>
          <span className="text-slate-400">{displayXp} XP</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-700/80">
          <div
            className="xp-bar-fill h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
            style={{ width: `${barProgress}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-800/90 via-blue-950/40 to-slate-800/90 p-4 ring-1 ring-blue-500/20">
      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(255,255,255,0.03) 19px, rgba(255,255,255,0.03) 20px), repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(255,255,255,0.03) 19px, rgba(255,255,255,0.03) 20px)",
        }}
      />

      {showEarnedPopup && earnedXp && (
        <div className="xp-earned-popup absolute right-4 top-3 z-10 rounded-lg bg-lime-500/20 px-3 py-1.5 text-sm font-bold text-lime-400 ring-1 ring-lime-500/40">
          +{earnedXp} XP
        </div>
      )}

      <div className="relative flex items-center gap-3">
        <LevelBadge level={current} size="md" />

        <div className="min-w-0 flex-1">
          <p className="text-center text-sm font-bold tracking-wide text-white">
            <span className="text-blue-300/60">[</span>
            {current.title} · Rank {currentLevel}
            <span className="text-blue-300/60">]</span>
          </p>

          <div className="relative mt-2 h-3 overflow-hidden rounded-sm bg-slate-900/80 ring-1 ring-slate-600/50">
            <div
              className="xp-bar-fill absolute inset-y-0 left-0 rounded-sm bg-gradient-to-r from-blue-500 to-sky-400"
              style={{ width: `${barProgress}%` }}
            />
            {isAnimating && earnedXp && earnedXp > 0 && (
              <div
                className="xp-bar-bonus absolute inset-y-0 rounded-sm bg-gradient-to-r from-lime-400 to-green-400"
                style={{
                  left: `${previousProgress}%`,
                  width: `${Math.max(0, barProgress - previousProgress)}%`,
                }}
              />
            )}
          </div>

          <div className="mt-1.5 flex items-center justify-between text-[11px]">
            {next ? (
              <>
                <span className="text-slate-400">
                  {xpInLevel} / {xpNeeded} XP
                </span>
                <span className="font-semibold text-lime-400/90">
                  {Math.round(barProgress)}%
                </span>
              </>
            ) : (
              <span className="text-amber-400">Max level {currentLevel}!</span>
            )}
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-lg font-bold tabular-nums text-white">{displayXp}</p>
          <p className="text-[10px] uppercase tracking-wider text-slate-500">XP</p>
        </div>
      </div>

      {showRewardsLink && (
        <Link
          href="/rewards"
          className="relative mt-3 flex items-center justify-center gap-1 rounded-lg bg-slate-900/60 py-2 text-xs font-medium text-blue-400 transition hover:bg-slate-900 hover:text-blue-300"
        >
          Odměny a odznaky →
        </Link>
      )}
    </div>
  );
}
