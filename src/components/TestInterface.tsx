"use client";

import {
  Question,
  buildSavedAnswers,
  calculateScore,
  formatTime,
  isPassed,
  TEST_DURATION_SECONDS,
} from "@/lib/test-utils";
import { saveTestResult } from "@/lib/test-results";
import { processTestCompletion, TestCompletionResult } from "@/lib/user-progress";
import { submitChallengeResult } from "@/lib/challenges";
import AnswerReview from "@/components/AnswerReview";
import AchievementToast from "@/components/AchievementToast";
import LevelUpModal from "@/components/LevelUpModal";
import { useAuth } from "@/context/AuthContext";
import { LevelDefinition, XP_ANIMATION_KEY } from "@/lib/gamification";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface TestInterfaceProps {
  questions: Question[];
  challengeId?: string;
  skipXp?: boolean;
  onChallengeComplete?: () => void;
}

type TestPhase = "testing" | "results" | "waiting";

export default function TestInterface({
  questions,
  challengeId,
  skipXp = false,
  onChallengeComplete,
}: TestInterfaceProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION_SECONDS);
  const [phase, setPhase] = useState<TestPhase>("testing");
  const [score, setScore] = useState(0);
  const [savedAnswers, setSavedAnswers] = useState<ReturnType<typeof buildSavedAnswers>>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [completionResult, setCompletionResult] = useState<TestCompletionResult | null>(null);
  const [levelUpQueue, setLevelUpQueue] = useState<LevelDefinition[]>([]);
  const [showAchievements, setShowAchievements] = useState(false);
  const hasEndedRef = useRef(false);

  const handleLevelUpClose = () => {
    setLevelUpQueue((queue) => queue.slice(1));
  };

  const endTest = useCallback(async () => {
    if (hasEndedRef.current) return;
    hasEndedRef.current = true;

    const finalScore = calculateScore(questions, answers);
    const passed = isPassed(finalScore);
    const reviewAnswers = buildSavedAnswers(questions, answers);
    setScore(finalScore);
    setSavedAnswers(reviewAnswers);

    if (challengeId && user) {
      setSaving(true);
      try {
        await submitChallengeResult(challengeId, user.uid, finalScore, passed);
        if (!skipXp) {
          await saveTestResult(user.uid, finalScore, 25, passed, reviewAnswers);
          const result = await processTestCompletion(user.uid, finalScore, passed);
          setCompletionResult(result);
          if (result.newLevels.length > 0) setLevelUpQueue(result.newLevels);
          if (result.newAchievements.length > 0) setShowAchievements(true);
        }
        setSaved(true);
        setPhase("waiting");
        onChallengeComplete?.();
      } catch (error) {
        console.error("Failed to submit challenge result:", error);
        setPhase("results");
      } finally {
        setSaving(false);
      }
      return;
    }

    setPhase("results");

    if (user) {
      setSaving(true);
      try {
        await saveTestResult(user.uid, finalScore, 25, passed, reviewAnswers);
        setSaved(true);

        const result = await processTestCompletion(user.uid, finalScore, passed);
        setCompletionResult(result);

        if (result.newLevels.length > 0) {
          setLevelUpQueue(result.newLevels);
        }

        if (result.newAchievements.length > 0) {
          setShowAchievements(true);
        }
      } catch (error) {
        console.error("Failed to save test result:", error);
      } finally {
        setSaving(false);
      }
    }
  }, [questions, answers, user, challengeId, skipXp, onChallengeComplete]);

  useEffect(() => {
    if (phase !== "testing") return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          endTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, endTest]);

  const handleAnswer = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const isLowTime = timeLeft <= 60;

  if (phase === "waiting") {
    return (
      <div className="mx-auto max-w-md rounded-2xl bg-slate-800 p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600/20 text-3xl">
          ⏳
        </div>
        <h2 className="text-xl font-bold text-white">Test dokončen!</h2>
        <p className="mt-2 text-4xl font-bold text-white">{score} / 25</p>
        <p className="mt-4 text-slate-400">
          Čeká se na ostatní hráče...
        </p>
        {saving && <p className="mt-2 text-sm text-slate-500">Ukládání...</p>}
        {saved && <p className="mt-2 text-sm text-green-400">Výsledek uložen</p>}
      </div>
    );
  }

  if (phase === "results") {
    const passed = isPassed(score);
    const xp = completionResult?.xpBreakdown;

    return (
      <>
        {levelUpQueue.length > 0 && user && (
          <LevelUpModal
            level={levelUpQueue[0]}
            userId={user.uid}
            onClose={handleLevelUpClose}
          />
        )}

        {showAchievements && completionResult && (
          <AchievementToast
            achievements={completionResult.newAchievements}
            onDone={() => setShowAchievements(false)}
          />
        )}

        <div className="space-y-8 px-4 pb-8">
          <div
            className={`mx-auto w-full max-w-md rounded-2xl p-8 text-center shadow-xl ${
              passed
                ? "bg-green-600/20 ring-2 ring-green-500"
                : "bg-red-600/20 ring-2 ring-red-500"
            }`}
          >
            <div
              className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full text-3xl font-bold ${
                passed ? "bg-green-600 text-white" : "bg-red-600 text-white"
              }`}
            >
              {passed ? "✓" : "✗"}
            </div>
            <h2
              className={`text-2xl font-bold sm:text-3xl ${
                passed ? "text-green-400" : "text-red-400"
              }`}
            >
              {passed ? "ÚSPĚCH" : "NEÚSPĚCH"}
            </h2>
            <p className="mt-4 text-4xl font-bold text-white">
              {score} / 25
            </p>
            <p className="mt-2 text-slate-300">
              Pro úspěch je potřeba minimálně 23 bodů
            </p>

            {completionResult && (
              <div className="mt-6 rounded-xl bg-slate-900/50 p-4 text-left">
                <p className="mb-2 text-center text-sm font-semibold uppercase tracking-wide text-blue-400">
                  Získané XP
                </p>
                <div className="space-y-1 text-sm text-slate-300">
                  <div className="flex justify-between">
                    <span>Správné odpovědi ({score}×10)</span>
                    <span className="font-semibold text-white">
                      +{xp?.correctAnswers ?? 0}
                    </span>
                  </div>
                  {(xp?.passBonus ?? 0) > 0 && (
                    <div className="flex justify-between">
                      <span>Bonus za splnění</span>
                      <span className="font-semibold text-green-400">
                        +{xp?.passBonus}
                      </span>
                    </div>
                  )}
                  {(xp?.perfectBonus ?? 0) > 0 && (
                    <div className="flex justify-between">
                      <span>Perfektní skóre</span>
                      <span className="font-semibold text-amber-400">
                        +{xp?.perfectBonus}
                      </span>
                    </div>
                  )}
                  {(xp?.achievementBonus ?? 0) > 0 && (
                    <div className="flex justify-between">
                      <span>Achievementy</span>
                      <span className="font-semibold text-purple-400">
                        +{xp?.achievementBonus}
                      </span>
                    </div>
                  )}
                  <div className="mt-2 flex justify-between border-t border-slate-700 pt-2 text-base">
                    <span className="font-bold text-white">Celkem</span>
                    <span className="font-bold text-blue-400">
                      +{completionResult.totalXpEarned} XP
                    </span>
                  </div>
                </div>
              </div>
            )}

            {saving && (
              <p className="mt-4 text-sm text-slate-400">Ukládání výsledku...</p>
            )}
            {saved && (
              <p className="mt-4 text-sm text-green-400">Výsledek uložen</p>
            )}
            <button
              onClick={() => {
                if (completionResult) {
                  sessionStorage.setItem(
                    XP_ANIMATION_KEY,
                    JSON.stringify({
                      previousXp:
                        completionResult.progress.totalXp -
                        completionResult.totalXpEarned,
                      newXp: completionResult.progress.totalXp,
                      earnedXp: completionResult.totalXpEarned,
                    })
                  );
                }
                router.push("/dashboard");
              }}
              className="mt-8 w-full rounded-xl bg-blue-600 py-4 text-base font-semibold text-white transition hover:bg-blue-500 active:scale-[0.98]"
            >
              Zpět na Dashboard
            </button>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-bold text-white">Přehled odpovědí</h3>
            <AnswerReview answers={savedAnswers} />
          </div>
        </div>
      </>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="text-center text-slate-400">
        Žádné otázky k zobrazení.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="sticky top-0 z-10 -mx-4 mb-6 border-b border-slate-700 bg-slate-900/95 px-4 py-4 backdrop-blur-sm sm:-mx-6 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-400">
            Otázka {currentIndex + 1} / {questions.length}
          </div>
          <div
            className={`rounded-xl px-4 py-2 font-mono text-lg font-bold ${
              isLowTime
                ? "animate-pulse bg-red-600/20 text-red-400"
                : "bg-slate-800 text-white"
            }`}
          >
            {formatTime(timeLeft)}
          </div>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-700">
          <div
            className="h-full rounded-full bg-blue-500 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Zodpovězeno: {answeredCount} / {questions.length}
        </p>
      </div>

      <div className="mb-6 rounded-2xl bg-slate-800 p-5 sm:p-6">
        <h2 className="text-base font-semibold leading-relaxed text-white sm:text-lg">
          {currentQuestion.text}
        </h2>
      </div>

      <div className="space-y-3">
        {currentQuestion.options.map((option, index) => {
          const isSelected = answers[currentQuestion.id] === index;
          return (
            <button
              key={index}
              onClick={() => handleAnswer(currentQuestion.id, index)}
              className={`w-full rounded-xl border-2 p-4 text-left text-sm leading-relaxed transition active:scale-[0.99] sm:p-5 sm:text-base ${
                isSelected
                  ? "border-blue-500 bg-blue-600/20 text-white"
                  : "border-slate-600 bg-slate-800 text-slate-200 hover:border-slate-500"
              }`}
            >
              <span className="mr-3 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-700 text-xs font-bold">
                {String.fromCharCode(65 + index)}
              </span>
              {option}
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="flex-1 rounded-xl border border-slate-600 py-4 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Předchozí
        </button>
        <button
          onClick={handleNext}
          disabled={currentIndex === questions.length - 1}
          className="flex-1 rounded-xl bg-slate-700 py-4 text-sm font-semibold text-white transition hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Další
        </button>
      </div>

      <button
        onClick={endTest}
        className="mt-4 w-full rounded-xl bg-red-600 py-4 text-base font-semibold text-white transition hover:bg-red-500 active:scale-[0.98]"
      >
        Uložit a ukončit
      </button>
    </div>
  );
}
