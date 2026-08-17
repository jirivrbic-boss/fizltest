export type {
  LevelDefinition,
  AchievementDefinition,
  UserStats,
  XpBreakdown,
  XpAnimationPayload,
} from "./gamification-types";
export { XP_ANIMATION_KEY } from "./gamification-types";

import {
  AchievementDefinition,
  LevelDefinition,
  UserStats,
  XpBreakdown,
} from "./gamification-types";
import { MAX_LEVEL, buildLevels } from "./levels-data";

export { MAX_LEVEL };

export const XP_PER_CORRECT_ANSWER = 10;
export const XP_PASS_BONUS = 150;
export const XP_PERFECT_BONUS = 100;

export const LEVELS: LevelDefinition[] = buildLevels();

export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: "first_test",
    title: "První kroky",
    description: "Dokončil jsi svůj první test",
    emoji: "👣",
    xpReward: 25,
  },
  {
    id: "first_pass",
    title: "Složeno!",
    description: "Poprvé jsi úspěšně složil test",
    emoji: "✅",
    xpReward: 50,
  },
  {
    id: "perfect_score",
    title: "Bezchybný výkon",
    description: "Dosáhl jsi 25/25 bodů",
    emoji: "💯",
    xpReward: 100,
  },
  {
    id: "tests_5",
    title: "Maratonář",
    description: "Dokončil jsi 5 testů",
    emoji: "🏃",
    xpReward: 75,
  },
  {
    id: "tests_10",
    title: "Vytrvalec",
    description: "Dokončil jsi 10 testů",
    emoji: "💪",
    xpReward: 150,
  },
  {
    id: "tests_25",
    title: "Neúnavný",
    description: "Dokončil jsi 25 testů",
    emoji: "🔋",
    xpReward: 300,
  },
  {
    id: "pass_streak_3",
    title: "Na vlně",
    description: "3 úspěšné testy po sobě",
    emoji: "🌊",
    xpReward: 100,
  },
  {
    id: "pass_streak_5",
    title: "Neporazitelný",
    description: "5 úspěšných testů po sobě",
    emoji: "🦾",
    xpReward: 200,
  },
  {
    id: "level_5",
    title: "Specialista",
    description: "Dosáhl jsi levelu 5",
    emoji: "🎯",
    xpReward: 0,
  },
  {
    id: "level_10",
    title: "Velmistr desítky",
    description: "Dosáhl jsi levelu 10",
    emoji: "🏆",
    xpReward: 0,
  },
  {
    id: "level_25",
    title: "Mistr vyšetřování",
    description: "Dosáhl jsi levelu 25",
    emoji: "🗝️",
    xpReward: 0,
  },
  {
    id: "level_50",
    title: "Legenda PČR",
    description: "Dosáhl jsi maximálního levelu 50",
    emoji: "👑",
    xpReward: 0,
  },
  {
    id: "xp_1000",
    title: "Sběratel XP",
    description: "Nasbíral jsi 1000 XP",
    emoji: "✨",
    xpReward: 0,
  },
  {
    id: "correct_100",
    title: "Stovka správných",
    description: "100 správných odpovědí celkem",
    emoji: "🎓",
    xpReward: 50,
  },
];

export function getDefaultStats(): UserStats {
  return {
    testsCompleted: 0,
    testsPassed: 0,
    perfectScores: 0,
    totalCorrectAnswers: 0,
    currentPassStreak: 0,
    bestPassStreak: 0,
  };
}

export function getLevelFromXp(xp: number): number {
  let level = 1;

  for (const definition of LEVELS) {
    if (xp >= definition.xpRequired) {
      level = definition.level;
    } else {
      break;
    }
  }

  return level;
}

export function getLevelDefinition(level: number): LevelDefinition {
  return LEVELS.find((definition) => definition.level === level) ?? LEVELS[0];
}

export function getLevelProgress(xp: number) {
  const currentLevel = getLevelFromXp(xp);
  const current = getLevelDefinition(currentLevel);
  const next = LEVELS.find((definition) => definition.level === currentLevel + 1);

  if (!next) {
    return {
      currentLevel,
      current,
      next: null,
      progress: 100,
      xpInLevel: 0,
      xpNeeded: 0,
      xpToNext: 0,
    };
  }

  const xpInLevel = xp - current.xpRequired;
  const xpNeeded = next.xpRequired - current.xpRequired;

  return {
    currentLevel,
    current,
    next,
    progress: Math.min(100, (xpInLevel / xpNeeded) * 100),
    xpInLevel,
    xpNeeded,
    xpToNext: next.xpRequired - xp,
  };
}

export function getNewLevels(previousXp: number, newXp: number): LevelDefinition[] {
  const previousLevel = getLevelFromXp(previousXp);
  const newLevel = getLevelFromXp(newXp);

  return LEVELS.filter(
    (definition) =>
      definition.level > previousLevel && definition.level <= newLevel
  );
}

export function calculateTestXp(score: number, passed: boolean): XpBreakdown {
  const correctAnswers = score * XP_PER_CORRECT_ANSWER;
  const passBonus = passed ? XP_PASS_BONUS : 0;
  const perfectBonus = score === 25 ? XP_PERFECT_BONUS : 0;

  return {
    correctAnswers,
    passBonus,
    perfectBonus,
    achievementBonus: 0,
  };
}

export function getTotalXpFromBreakdown(breakdown: XpBreakdown): number {
  return (
    breakdown.correctAnswers +
    breakdown.passBonus +
    breakdown.perfectBonus +
    breakdown.achievementBonus
  );
}

export function checkAchievements(
  stats: UserStats,
  totalXp: number,
  unlockedAchievements: string[]
): { newAchievements: AchievementDefinition[]; bonusXp: number } {
  const newAchievements: AchievementDefinition[] = [];
  let bonusXp = 0;

  const tryUnlock = (id: string) => {
    if (unlockedAchievements.includes(id)) return;
    const achievement = ACHIEVEMENTS.find((item) => item.id === id);
    if (!achievement) return;
    newAchievements.push(achievement);
    bonusXp += achievement.xpReward;
  };

  if (stats.testsCompleted >= 1) tryUnlock("first_test");
  if (stats.testsPassed >= 1) tryUnlock("first_pass");
  if (stats.perfectScores >= 1) tryUnlock("perfect_score");
  if (stats.testsCompleted >= 5) tryUnlock("tests_5");
  if (stats.testsCompleted >= 10) tryUnlock("tests_10");
  if (stats.testsCompleted >= 25) tryUnlock("tests_25");
  if (stats.bestPassStreak >= 3) tryUnlock("pass_streak_3");
  if (stats.bestPassStreak >= 5) tryUnlock("pass_streak_5");
  if (getLevelFromXp(totalXp) >= 5) tryUnlock("level_5");
  if (getLevelFromXp(totalXp) >= 10) tryUnlock("level_10");
  if (getLevelFromXp(totalXp) >= 25) tryUnlock("level_25");
  if (getLevelFromXp(totalXp) >= MAX_LEVEL) tryUnlock("level_50");
  if (totalXp >= 1000) tryUnlock("xp_1000");
  if (stats.totalCorrectAnswers >= 100) tryUnlock("correct_100");

  return { newAchievements, bonusXp };
}

export function getUnclaimedLevels(
  totalXp: number,
  claimedLevelRewards: number[]
): LevelDefinition[] {
  const currentLevel = getLevelFromXp(totalXp);

  return LEVELS.filter(
    (definition) =>
      definition.level <= currentLevel &&
      definition.level > 1 &&
      !claimedLevelRewards.includes(definition.level)
  );
}

export function getLevelStatus(
  level: number,
  totalXp: number,
  claimedLevelRewards: number[]
): "locked" | "unclaimed" | "claimed" {
  const currentLevel = getLevelFromXp(totalXp);

  if (level > currentLevel) return "locked";
  if (claimedLevelRewards.includes(level)) return "claimed";
  if (level === 1) return "claimed";
  return "unclaimed";
}
