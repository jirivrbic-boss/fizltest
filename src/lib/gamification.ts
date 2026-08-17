export const XP_PER_CORRECT_ANSWER = 10;
export const XP_PASS_BONUS = 150;
export const XP_PERFECT_BONUS = 100;

export interface LevelDefinition {
  level: number;
  xpRequired: number;
  title: string;
  reward: string;
  rewardEmoji: string;
  message: string;
  gradient: string;
}

export const LEVELS: LevelDefinition[] = [
  {
    level: 1,
    xpRequired: 0,
    title: "Nováček",
    reward: "Vstupní odznak",
    rewardEmoji: "🌱",
    message: "Vítej v řadách! Každý velký policista začíná prvním krokem.",
    gradient: "from-slate-500 to-slate-700",
  },
  {
    level: 2,
    xpRequired: 200,
    title: "Strážník v výcviku",
    reward: "Stříbrný štít",
    rewardEmoji: "🛡️",
    message: "Tvoje vytrvalost se vyplácí. Pokračuj v tréninku — jsi na dobré cestě!",
    gradient: "from-blue-500 to-blue-700",
  },
  {
    level: 3,
    xpRequired: 500,
    title: "Patrolní policista",
    reward: "Modrý prapor",
    rewardEmoji: "🚔",
    message: "Už znáš základy na zpaměť. Teď je čas posunout laťku výš!",
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    level: 4,
    xpRequired: 900,
    title: "Zkušený strážník",
    reward: "Zlatá hvězda",
    rewardEmoji: "⭐",
    message: "Skvělá práce! Tvoje znalosti rostou rychleji než pochybnosti.",
    gradient: "from-amber-400 to-orange-500",
  },
  {
    level: 5,
    xpRequired: 1400,
    title: "Specialista",
    reward: "Elitní odznak",
    rewardEmoji: "🏅",
    message: "Polovina cesty je za tebou. Jsi mezi nejlepšími kandidáty!",
    gradient: "from-purple-500 to-indigo-600",
  },
  {
    level: 6,
    xpRequired: 2000,
    title: "Expert",
    reward: "Diamantový kříž",
    rewardEmoji: "💎",
    message: "Tvoje odhodlání je inspirující. Služba tě volá!",
    gradient: "from-violet-500 to-purple-700",
  },
  {
    level: 7,
    xpRequired: 2800,
    title: "Mistr testů",
    reward: "Platinový věnec",
    rewardEmoji: "👑",
    message: "Už těmto otázkám vládneš. Jsi připraven na cokoliv!",
    gradient: "from-yellow-400 to-amber-600",
  },
  {
    level: 8,
    xpRequired: 3800,
    title: "Veterán",
    reward: "Čestný meč",
    rewardEmoji: "⚔️",
    message: "Tvoje znalosti jsou zbraní. Používej je moudře!",
    gradient: "from-red-500 to-rose-600",
  },
  {
    level: 9,
    xpRequired: 5000,
    title: "Legenda",
    reward: "Legendární plaketa",
    rewardEmoji: "🔥",
    message: "Málokdo se dostane tak daleko. Ty jsi výjimka!",
    gradient: "from-orange-500 to-red-600",
  },
  {
    level: 10,
    xpRequired: 6500,
    title: "Velmistr PČR",
    reward: "Nejvyšší vyznamenání",
    rewardEmoji: "🏆",
    message: "Dosáhl jsi vrcholu! Jsi připraven na služební test na 100 %.",
    gradient: "from-emerald-400 via-yellow-400 to-amber-500",
  },
];

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  emoji: string;
  xpReward: number;
}

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
    title: "Velmistr",
    description: "Dosáhl jsi maximálního levelu",
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

export interface UserStats {
  testsCompleted: number;
  testsPassed: number;
  perfectScores: number;
  totalCorrectAnswers: number;
  currentPassStreak: number;
  bestPassStreak: number;
}

export interface XpBreakdown {
  correctAnswers: number;
  passBonus: number;
  perfectBonus: number;
  achievementBonus: number;
}

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
