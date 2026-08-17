import { addDoc, collection, getDocs, query, where, Timestamp } from "firebase/firestore";
import { getFirebaseDb } from "./firebase";

export interface SavedAnswer {
  questionId: number;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  selectedAnswerIndex: number | null;
}

export interface TestResult {
  id?: string;
  userId: string;
  score: number;
  total: number;
  passed: boolean;
  timestamp: Date;
  answers?: SavedAnswer[];
}

function parseSavedAnswers(data: unknown): SavedAnswer[] | undefined {
  if (!Array.isArray(data)) return undefined;

  return data.map((item) => ({
    questionId: item.questionId,
    questionText: item.questionText,
    options: item.options,
    correctAnswerIndex: item.correctAnswerIndex,
    selectedAnswerIndex:
      item.selectedAnswerIndex === undefined ? null : item.selectedAnswerIndex,
  }));
}

export async function saveTestResult(
  userId: string,
  score: number,
  total: number,
  passed: boolean,
  answers: SavedAnswer[]
): Promise<void> {
  await addDoc(collection(getFirebaseDb(), "test_results"), {
    userId,
    score,
    total,
    passed,
    answers,
    timestamp: Timestamp.now(),
  });
}

export async function getUserTestResults(userId: string): Promise<TestResult[]> {
  const q = query(
    collection(getFirebaseDb(), "test_results"),
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
        answers: parseSavedAnswers(data.answers),
      };
    })
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}
