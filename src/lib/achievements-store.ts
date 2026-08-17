import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { getFirebaseDb } from "./firebase";
import { ACHIEVEMENTS as DEFAULT_ACHIEVEMENTS } from "./gamification";
import type { AchievementDefinition } from "./gamification-types";

export interface StoredAchievement extends AchievementDefinition {
  firestoreId?: string;
  condition?: string;
  isDefault?: boolean;
}

export async function getAllAchievements(): Promise<StoredAchievement[]> {
  const snapshot = await getDocs(
    query(collection(getFirebaseDb(), "achievements"), orderBy("title", "asc"))
  );

  if (snapshot.empty) {
    return DEFAULT_ACHIEVEMENTS.map((a) => ({ ...a, isDefault: true }));
  }

  return snapshot.docs.map((docSnap) => ({
    id: docSnap.data().id ?? docSnap.id,
    firestoreId: docSnap.id,
    title: docSnap.data().title,
    description: docSnap.data().description,
    emoji: docSnap.data().emoji,
    xpReward: docSnap.data().xpReward ?? 0,
    condition: docSnap.data().condition ?? "",
    isDefault: docSnap.data().isDefault ?? false,
  }));
}

export async function seedDefaultAchievementsIfEmpty(): Promise<void> {
  const snapshot = await getDocs(collection(getFirebaseDb(), "achievements"));
  if (!snapshot.empty) return;

  for (const achievement of DEFAULT_ACHIEVEMENTS) {
    await addDoc(collection(getFirebaseDb(), "achievements"), {
      ...achievement,
      isDefault: true,
      condition: achievement.id,
    });
  }
}

export async function createAchievement(
  data: Omit<AchievementDefinition, "id"> & { id: string; condition?: string }
): Promise<void> {
  await addDoc(collection(getFirebaseDb(), "achievements"), {
    ...data,
    isDefault: false,
  });
}

export async function updateAchievement(
  firestoreId: string,
  data: Partial<AchievementDefinition & { condition?: string }>
): Promise<void> {
  await updateDoc(doc(getFirebaseDb(), "achievements", firestoreId), data);
}

export async function deleteAchievement(firestoreId: string): Promise<void> {
  await deleteDoc(doc(getFirebaseDb(), "achievements", firestoreId));
}
