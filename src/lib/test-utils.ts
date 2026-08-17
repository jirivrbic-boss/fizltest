import type { Question } from "./tests";
import type { SavedAnswer } from "./test-results";

export type { Question };

export const TEST_QUESTION_COUNT = 25;
export const TEST_DURATION_SECONDS = 20 * 60;
export const PASSING_SCORE = 23;
export const MAX_SCORE = 25;

export function selectRandomQuestionsFromPool(
  pool: Question[],
  count: number = TEST_QUESTION_COUNT
): Question[] {
  if (pool.length === 0) return [];
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  if (pool.length <= count) return shuffled;
  return shuffled.slice(0, count);
}

export function calculateScore(
  testQuestions: Question[],
  answers: Record<string, number>
): number {
  return testQuestions.reduce((score, question) => {
    if (answers[question.id] === question.correctAnswerIndex) {
      return score + 1;
    }
    return score;
  }, 0);
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function isPassed(score: number): boolean {
  return score >= PASSING_SCORE;
}

export function buildSavedAnswers(
  testQuestions: Question[],
  answers: Record<string, number>
): SavedAnswer[] {
  return testQuestions.map((question) => ({
    questionId: question.id,
    questionText: question.text,
    options: question.options,
    correctAnswerIndex: question.correctAnswerIndex,
    selectedAnswerIndex: answers[question.id] ?? null,
  }));
}
