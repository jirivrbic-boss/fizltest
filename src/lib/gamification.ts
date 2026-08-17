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

type AchievementMilestone = readonly [
  threshold: number,
  title: string,
  emoji: string,
  xpReward: number,
];

function buildMilestones(
  prefix: string,
  milestones: readonly AchievementMilestone[],
  description: (threshold: number) => string,
  firstId?: string
): AchievementDefinition[] {
  return milestones.map(([threshold, title, emoji, xpReward], index) => ({
    id: index === 0 && firstId ? firstId : `${prefix}_${threshold}`,
    title,
    description: description(threshold),
    emoji,
    xpReward,
  }));
}

const TEST_MILESTONES: readonly AchievementMilestone[] = [
  [1, "První kroky", "👣", 25],
  [2, "Dvojitá hlídka", "👮", 30],
  [3, "Rozjezd", "🚓", 40],
  [5, "Maratonář", "🏃", 75],
  [10, "Vytrvalec", "💪", 150],
  [25, "Neúnavný", "🔋", 300],
  [50, "Testový veterán", "🎖️", 400],
  [75, "Sedmdesát pět směn", "🚔", 500],
  [100, "Stovka testů", "💯", 650],
  [150, "Ostřílený praktik", "🎯", 800],
  [200, "Dvousettestový klub", "🏅", 1000],
  [300, "Nezastavitelný", "⚡", 1250],
  [500, "Legenda testů", "🏆", 1800],
];

const PASS_MILESTONES: readonly AchievementMilestone[] = [
  [1, "Složeno!", "✅", 50],
  [3, "Jistý krok", "👟", 60],
  [5, "Pětkrát úspěšný", "⭐", 90],
  [10, "Desítka bez obav", "🛡️", 150],
  [25, "Spolehlivý", "🤝", 250],
  [50, "Profesionál", "💼", 400],
  [75, "Prověřený znalec", "📜", 500],
  [100, "Stokrát úspěšný", "🌟", 700],
  [150, "Elitní znalec", "💎", 900],
  [250, "Mistr úspěchu", "🥇", 1200],
  [400, "Neomylný veterán", "👑", 1600],
];

const PERFECT_MILESTONES: readonly AchievementMilestone[] = [
  [1, "Bezchybný výkon", "💯", 100],
  [3, "Trojitá dokonalost", "🎯", 140],
  [5, "Pět hvězd", "⭐", 200],
  [10, "Dokonalá desítka", "🔟", 300],
  [20, "Bezchybný specialista", "🥇", 450],
  [30, "Mistr přesnosti", "🏹", 600],
  [50, "Padesát nulových chyb", "🛡️", 850],
  [75, "Chodící klíč", "🗝️", 1100],
  [100, "Absolutní dokonalost", "👑", 1500],
];

const STREAK_MILESTONES: readonly AchievementMilestone[] = [
  [3, "Na vlně", "🌊", 100],
  [5, "Neporazitelný", "🦾", 200],
  [10, "Vítězná série", "🔥", 300],
  [15, "Bez zaváhání", "⚡", 450],
  [20, "Dvacet v řadě", "🚀", 600],
  [30, "Železná forma", "🪖", 850],
  [50, "Série legendy", "🏆", 1250],
];

const CORRECT_MILESTONES: readonly AchievementMilestone[] = [
  [25, "První plná sada", "🧠", 25],
  [50, "Padesát správně", "✍️", 35],
  [100, "Stovka správných", "🎓", 50],
  [250, "Přesná muška", "🎯", 100],
  [500, "Půl tisíce znalostí", "📘", 175],
  [1000, "Tisíc odpovědí", "📚", 300],
  [2500, "Databáze v hlavě", "🧠", 500],
  [5000, "Encyklopedista", "📚", 800],
  [10000, "Deset tisíc zásahů", "🌠", 1300],
];

const LEVEL_MILESTONES: readonly AchievementMilestone[] = [
  [2, "První povýšení", "🆙", 0],
  [3, "Rozjetá kariéra", "🚓", 0],
  [5, "Specialista", "🎯", 0],
  [10, "Velmistr desítky", "🏆", 0],
  [15, "Operační talent", "🦺", 0],
  [20, "Velitel oddělení", "🌟", 0],
  [25, "Mistr vyšetřování", "🗝️", 0],
  [30, "Strážce zákona", "⚖️", 0],
  [35, "Velitel operace", "🏁", 0],
  [40, "Legenda služby", "🔱", 0],
  [45, "Mistr PČR", "🎖️", 0],
  [50, "Legenda PČR", "👑", 0],
];

const XP_MILESTONES: readonly AchievementMilestone[] = [
  [500, "První balík XP", "🎁", 0],
  [1000, "Sběratel XP", "✨", 0],
  [2500, "Lovec XP", "🏹", 0],
  [5000, "XP specialista", "💠", 0],
  [10000, "Deset tisíc XP", "💰", 0],
  [25000, "XP magnát", "🧲", 0],
  [50000, "XP velmistr", "💎", 0],
  [100000, "Stotisícová legenda", "🌌", 0],
];

export const ACHIEVEMENTS: AchievementDefinition[] = [
  ...buildMilestones("tests", TEST_MILESTONES, (count) => `Dokončil jsi ${count} testů`, "first_test"),
  ...buildMilestones("passes", PASS_MILESTONES, (count) => `Úspěšně jsi složil ${count} testů`, "first_pass"),
  ...buildMilestones("perfect", PERFECT_MILESTONES, (count) => `Získal jsi ${count}× plný počet 25/25`, "perfect_score"),
  ...buildMilestones("pass_streak", STREAK_MILESTONES, (count) => `${count} úspěšných testů po sobě`),
  ...buildMilestones("correct", CORRECT_MILESTONES, (count) => `${count} správných odpovědí celkem`),
  ...buildMilestones("level", LEVEL_MILESTONES, (level) => `Dosáhl jsi levelu ${level}`),
  ...buildMilestones("xp", XP_MILESTONES, (xp) => `Nasbíral jsi ${xp.toLocaleString("cs-CZ")} XP`),
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
  const unlocked = new Set(unlockedAchievements);
  const newAchievements = ACHIEVEMENTS.filter(
    (achievement) =>
      !unlocked.has(achievement.id) &&
      isAchievementUnlocked(achievement.id, stats, totalXp)
  );

  return {
    newAchievements,
    bonusXp: newAchievements.reduce((sum, achievement) => sum + achievement.xpReward, 0),
  };
}

function isAchievementUnlocked(id: string, stats: UserStats, totalXp: number): boolean {
  if (id === "first_test") return stats.testsCompleted >= 1;
  if (id === "first_pass") return stats.testsPassed >= 1;
  if (id === "perfect_score") return stats.perfectScores >= 1;

  const match = id.match(/^(tests|passes|perfect|pass_streak|correct|level|xp)_(\d+)$/);
  if (!match) return false;

  const threshold = Number(match[2]);
  switch (match[1]) {
    case "tests":
      return stats.testsCompleted >= threshold;
    case "passes":
      return stats.testsPassed >= threshold;
    case "perfect":
      return stats.perfectScores >= threshold;
    case "pass_streak":
      return stats.bestPassStreak >= threshold;
    case "correct":
      return stats.totalCorrectAnswers >= threshold;
    case "level":
      return getLevelFromXp(totalXp) >= threshold;
    case "xp":
      return totalXp >= threshold;
    default:
      return false;
  }
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
