import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { getFirebaseDb } from "./firebase";
import questionsData from "../../lib/questions.json";

const DEFAULT_TEST_NAME = "Použití zbraně § 56";
const DEFAULT_TEST_DESCRIPTION = "Základní otázky k použití zbraně policistou";

export interface TestCategory {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  questionCount?: number;
}

export interface Question {
  id: string;
  testId: string;
  text: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface QuestionInput {
  text: string;
  options: string[];
  correctAnswerIndex: number;
}

function parseTest(id: string, data: Record<string, unknown>): TestCategory {
  return {
    id,
    name: (data.name as string) ?? "",
    description: (data.description as string) ?? "",
    createdAt: (data.createdAt as Timestamp)?.toDate?.() ?? new Date(),
  };
}

function parseQuestion(id: string, testId: string, data: Record<string, unknown>): Question {
  return {
    id,
    testId,
    text: (data.text as string) ?? "",
    options: (data.options as string[]) ?? [],
    correctAnswerIndex: (data.correctAnswerIndex as number) ?? 0,
  };
}

export async function getAllTests(): Promise<TestCategory[]> {
  const snapshot = await getDocs(
    query(collection(getFirebaseDb(), "tests"), orderBy("createdAt", "asc"))
  );

  const tests = snapshot.docs.map((docSnap) => parseTest(docSnap.id, docSnap.data()));

  const withCounts = await Promise.all(
    tests.map(async (test) => {
      const qSnap = await getDocs(collection(getFirebaseDb(), "tests", test.id, "questions"));
      return { ...test, questionCount: qSnap.size };
    })
  );

  return withCounts;
}

export async function getTest(testId: string): Promise<TestCategory | null> {
  const snap = await getDoc(doc(getFirebaseDb(), "tests", testId));
  if (!snap.exists()) return null;
  return parseTest(snap.id, snap.data());
}

export async function createTest(name: string, description: string): Promise<string> {
  const ref = await addDoc(collection(getFirebaseDb(), "tests"), {
    name,
    description,
    createdAt: Timestamp.now(),
  });
  return ref.id;
}

export async function updateTest(
  testId: string,
  data: { name?: string; description?: string }
): Promise<void> {
  await updateDoc(doc(getFirebaseDb(), "tests", testId), data);
}

export async function deleteTest(testId: string): Promise<void> {
  const qSnap = await getDocs(collection(getFirebaseDb(), "tests", testId, "questions"));
  await Promise.all(qSnap.docs.map((d) => deleteDoc(d.ref)));
  await deleteDoc(doc(getFirebaseDb(), "tests", testId));
}

export async function getQuestionsForTest(testId: string): Promise<Question[]> {
  const snapshot = await getDocs(collection(getFirebaseDb(), "tests", testId, "questions"));
  return snapshot.docs.map((docSnap) =>
    parseQuestion(docSnap.id, testId, docSnap.data())
  );
}

export async function getQuestionsForTests(testIds: string[]): Promise<Question[]> {
  const allQuestions = await Promise.all(testIds.map((id) => getQuestionsForTest(id)));
  return allQuestions.flat();
}

export async function addQuestion(testId: string, input: QuestionInput): Promise<string> {
  const ref = await addDoc(collection(getFirebaseDb(), "tests", testId, "questions"), {
    text: input.text,
    options: input.options,
    correctAnswerIndex: input.correctAnswerIndex,
  });
  return ref.id;
}

export async function updateQuestion(
  testId: string,
  questionId: string,
  input: QuestionInput
): Promise<void> {
  await updateDoc(doc(getFirebaseDb(), "tests", testId, "questions", questionId), {
    text: input.text,
    options: input.options,
    correctAnswerIndex: input.correctAnswerIndex,
  });
}

export async function deleteQuestion(testId: string, questionId: string): Promise<void> {
  await deleteDoc(doc(getFirebaseDb(), "tests", testId, "questions", questionId));
}

export async function seedDefaultTestIfEmpty(): Promise<boolean> {
  const snapshot = await getDocs(collection(getFirebaseDb(), "tests"));
  const existingDefaultTest = snapshot.docs.find(
    (testDoc) => testDoc.data().name === DEFAULT_TEST_NAME
  );
  const testRef = existingDefaultTest?.ref ?? doc(collection(getFirebaseDb(), "tests"));

  if (!existingDefaultTest) {
    await setDoc(testRef, {
      name: DEFAULT_TEST_NAME,
      description: DEFAULT_TEST_DESCRIPTION,
      createdAt: Timestamp.now(),
    });
  }

  const questionsRef = collection(getFirebaseDb(), "tests", testRef.id, "questions");
  const existingQuestions = await getDocs(questionsRef);
  const existingTexts = new Set(
    existingQuestions.docs.map((questionDoc) => normalizeQuestionText(questionDoc.data().text))
  );
  const missingQuestions = questionsData.filter(
    (question) => !existingTexts.has(normalizeQuestionText(question.text))
  );

  await Promise.all(
    missingQuestions.map(async (question) => {
      await setDoc(doc(questionsRef, `default-${question.id}`), {
        text: question.text,
        options: question.options,
        correctAnswerIndex: question.correctAnswerIndex,
        sourceId: question.id,
      });
    })
  );

  return !existingDefaultTest || missingQuestions.length > 0;
}

function normalizeQuestionText(value: unknown): string {
  return String(value ?? "")
    .normalize("NFKC")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("cs-CZ");
}
