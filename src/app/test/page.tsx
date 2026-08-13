"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import TestInterface from "@/components/TestInterface";
import { selectRandomQuestions } from "@/lib/test-utils";
import { useMemo } from "react";
import Link from "next/link";

export default function TestPage() {
  const questions = useMemo(() => selectRandomQuestions(25), []);

  return (
    <ProtectedRoute>
      <main className="mx-auto min-h-screen max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="text-sm text-slate-400 transition hover:text-white"
          >
            ← Dashboard
          </Link>
          <h1 className="text-lg font-bold text-white">Test</h1>
          <div className="w-20" />
        </div>

        <TestInterface questions={questions} />
      </main>
    </ProtectedRoute>
  );
}
