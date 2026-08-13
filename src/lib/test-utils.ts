import questionsData from "../../lib/questions.json";

export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswerIndex: number;
}

export const ALL_QUESTIONS = questionsData as Question[];

export const TEST_QUESTION_COUNT = 25;
export const TEST_DURATION_SECONDS = 20 * 60;
export const PASSING_SCORE = 23;
export const MAX_SCORE = 25;

export function selectRandomQuestions(count: number = TEST_QUESTION_COUNT): Question[] {
  const shuffled = [...ALL_QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function calculateScore(
  testQuestions: Question[],
  answers: Record<number, number>
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
