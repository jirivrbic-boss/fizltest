"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import TestInterface from "@/components/TestInterface";
import {
  getQuestionsForTests,
  seedDefaultTestIfEmpty,
} from "@/lib/tests";
import {
  selectRandomQuestionsFromPool,
  TEST_QUESTION_COUNT,
} from "@/lib/test-utils";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import type { Question } from "@/lib/tests";

function TestContent() {
  const searchParams = useSearchParams();
  const testIdsParam = searchParams.get("tests") ?? "";
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        await seedDefaultTestIfEmpty();
        let ids = testIdsParam.split(",").filter(Boolean);

        if (ids.length === 0) {
          const { getAllTests } = await import("@/lib/tests");
          const tests = await getAllTests();
          if (tests.length > 0) {
            ids = [tests[0].id];
          }
        }

        if (ids.length === 0) {
          setError("Nejsou k dispozici žádné testy.");
          setLoading(false);
          return;
        }

        const pool = await getQuestionsForTests(ids);
        if (pool.length < TEST_QUESTION_COUNT) {
          setError(`Vybrané testy mají jen ${pool.length} otázek. Pro test je potřeba alespoň ${TEST_QUESTION_COUNT}.`);
          setLoading(false);
          return;
        }

        setQuestions(selectRandomQuestionsFromPool(pool, TEST_QUESTION_COUNT));
      } catch {
        setError("Nepodařilo se načíst otázky.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [testIdsParam]);

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400">Příprava testu...</div>
    );
  }

  if (error) {
    return (
      <div className="py-20 text-center">
        <p className="text-red-400">{error}</p>
        <Link href="/test/select" className="mt-4 inline-block text-blue-400 hover:underline">
          Zpět na výběr testů
        </Link>
      </div>
    );
  }

  return <TestInterface questions={questions} />;
}

export default function TestPage() {
  return (
    <ProtectedRoute>
      <main className="mx-auto min-h-screen max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/test/select"
            className="text-sm text-slate-400 transition hover:text-white"
          >
            ← Výběr testů
          </Link>
          <h1 className="text-lg font-bold text-white">Test</h1>
          <div className="w-20" />
        </div>

        <Suspense fallback={<div className="py-20 text-center text-slate-400">Načítání...</div>}>
          <TestContent />
        </Suspense>
      </main>
    </ProtectedRoute>
  );
}
