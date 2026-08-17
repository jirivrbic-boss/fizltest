import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  type DocumentData,
} from "firebase/firestore";
import { getFirebaseDb } from "./firebase";
import {
  AchievementDefinition,
  LevelDefinition,
  UserStats,
  XpBreakdown,
  calculateTestXp,
  checkAchievements,
  getDefaultStats,
  getLevelFromXp,
  getNewLevels,
  getTotalXpFromBreakdown,
} from "./gamification";

export interface UserProgress {
  userId: string;
  totalXp: number;
  claimedLevelRewards: number[];
  unlockedAchievements: string[];
  stats: UserStats;
}

export interface TestCompletionResult {
  progress: UserProgress;
  xpBreakdown: XpBreakdown;
  totalXpEarned: number;
  newAchievements: AchievementDefinition[];
  newLevels: LevelDefinition[];
  previousLevel: number;
  newLevel: number;
}

function createDefaultProgress(userId: string): UserProgress {
  return {
    userId,
    totalXp: 0,
    claimedLevelRewards: [],
    unlockedAchievements: [],
    stats: getDefaultStats(),
  };
}

function parseProgress(userId: string, data: DocumentData): UserProgress {
  return {
    userId,
    totalXp: data.totalXp ?? 0,
    claimedLevelRewards: data.claimedLevelRewards ?? [],
    unlockedAchievements: data.unlockedAchievements ?? [],
    stats: {
      ...getDefaultStats(),
      ...data.stats,
    },
  };
}

export async function getUserProgress(userId: string): Promise<UserProgress> {
  const ref = doc(getFirebaseDb(), "user_progress", userId);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    return createDefaultProgress(userId);
  }

  return parseProgress(userId, snapshot.data());
}

export async function saveUserProgress(progress: UserProgress): Promise<void> {
  const ref = doc(getFirebaseDb(), "user_progress", progress.userId);
  await setDoc(ref, progress, { merge: true });
}

export async function processTestCompletion(
  userId: string,
  score: number,
  passed: boolean
): Promise<TestCompletionResult> {
  const progress = await getUserProgress(userId);
  const previousXp = progress.totalXp;
  const previousLevel = getLevelFromXp(previousXp);

  const updatedStats: UserStats = {
    ...progress.stats,
    testsCompleted: progress.stats.testsCompleted + 1,
    testsPassed: progress.stats.testsPassed + (passed ? 1 : 0),
    perfectScores: progress.stats.perfectScores + (score === 25 ? 1 : 0),
    totalCorrectAnswers: progress.stats.totalCorrectAnswers + score,
    currentPassStreak: passed ? progress.stats.currentPassStreak + 1 : 0,
    bestPassStreak: passed
      ? Math.max(progress.stats.bestPassStreak, progress.stats.currentPassStreak + 1)
      : progress.stats.bestPassStreak,
  };

  const xpBreakdown = calculateTestXp(score, passed);
  let totalXpEarned = getTotalXpFromBreakdown(xpBreakdown);
  let projectedXp = previousXp + totalXpEarned;
  const newAchievements: AchievementDefinition[] = [];
  const unlockedIds = new Set(progress.unlockedAchievements);

  while (true) {
    const achievementCheck = checkAchievements(
      updatedStats,
      projectedXp,
      [...unlockedIds]
    );
    if (achievementCheck.newAchievements.length === 0) break;

    for (const achievement of achievementCheck.newAchievements) {
      unlockedIds.add(achievement.id);
      newAchievements.push(achievement);
    }
    xpBreakdown.achievementBonus += achievementCheck.bonusXp;
    totalXpEarned += achievementCheck.bonusXp;
    projectedXp = previousXp + totalXpEarned;
  }

  const newTotalXp = previousXp + totalXpEarned;
  const newLevel = getLevelFromXp(newTotalXp);
  const newLevels = getNewLevels(previousXp, newTotalXp);

  const updatedProgress: UserProgress = {
    ...progress,
    totalXp: newTotalXp,
    stats: updatedStats,
    unlockedAchievements: [
      ...unlockedIds,
    ],
  };

  await saveUserProgress(updatedProgress);

  return {
    progress: updatedProgress,
    xpBreakdown,
    totalXpEarned,
    newAchievements,
    newLevels,
    previousLevel,
    newLevel,
  };
}

export async function claimLevelReward(
  userId: string,
  level: number
): Promise<UserProgress> {
  const progress = await getUserProgress(userId);
  const currentLevel = getLevelFromXp(progress.totalXp);

  if (level > currentLevel || progress.claimedLevelRewards.includes(level)) {
    return progress;
  }

  const ref = doc(getFirebaseDb(), "user_progress", userId);
  await updateDoc(ref, {
    claimedLevelRewards: arrayUnion(level),
  });

  return {
    ...progress,
    claimedLevelRewards: [...progress.claimedLevelRewards, level],
  };
}
