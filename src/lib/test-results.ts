import { addDoc, collection, getDocs, query, where, Timestamp } from "firebase/firestore";
import { db } from "./firebase";

export interface TestResult {
  id?: string;
  userId: string;
  score: number;
  total: number;
  passed: boolean;
  timestamp: Date;
}

export async function saveTestResult(
  userId: string,
  score: number,
  total: number,
  passed: boolean
): Promise<void> {
  await addDoc(collection(db, "test_results"), {
    userId,
    score,
    total,
    passed,
    timestamp: Timestamp.now(),
  });
}

export async function getUserTestResults(userId: string): Promise<TestResult[]> {
  const q = query(
    collection(db, "test_results"),
    where("userId", "==", userId)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        score: data.score,
        total: data.total,
        passed: data.passed,
        timestamp: data.timestamp?.toDate() ?? new Date(),
      };
    })
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}
