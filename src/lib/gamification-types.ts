export interface LevelDefinition {
  level: number;
  xpRequired: number;
  title: string;
  reward: string;
  rewardEmoji: string;
  message: string;
  gradient: string;
}

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  emoji: string;
  xpReward: number;
}

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

export interface XpAnimationPayload {
  previousXp: number;
  newXp: number;
  earnedXp: number;
}

export const XP_ANIMATION_KEY = "xpAnimation";
