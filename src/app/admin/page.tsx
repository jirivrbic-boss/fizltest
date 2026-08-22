"use client";

import {
  clearAdminSession,
  isAdminSession,
  setAdminSession,
  verifyAdminPassword,
} from "@/lib/admin-auth";
import {
  addQuestion,
  addQuestionsBatch,
  createTest,
  deleteQuestion,
  deleteTest,
  getAllTests,
  getQuestionsForTest,
  seedDefaultTestIfEmpty,
  updateQuestion,
  type Question,
  type TestCategory,
} from "@/lib/tests";
import { normalizeQuestionSearch, parseQuestionImport } from "@/lib/question-import";
import {
  createAchievement,
  deleteAchievement,
  getAllAchievements,
  seedDefaultAchievementsIfEmpty,
  type StoredAchievement,
} from "@/lib/achievements-store";
import { getAllUsers, type AppUser } from "@/lib/users";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { getLeaderboard, type Challenge } from "@/lib/challenges";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

type AdminTab = "tests" | "users" | "achievements" | "challenges";

const IMPORT_EXAMPLE = `zadání (Jak veliký je Jirka?)
špatná odpověď (180 cm)
správná odpověď (190 cm)
špatná odpověď (120 cm)

zadání (Kolik je 2 + 2?)
správná odpověď (4)
špatná odpověď (5)`;

function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyAdminPassword(password)) {
      setAdminSession();
      onLogin();
    } else {
      setError("Nesprávné heslo");
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-sm items-center px-4">
      <form onSubmit={handleSubmit} className="w-full space-y-4 rounded-2xl bg-slate-800 p-6">
        <h1 className="text-center text-xl font-bold text-white">Admin přístup</h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Heslo"
          className="w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-500"
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-500"
        >
          Přihlásit
        </button>
        <Link href="/dashboard" className="block text-center text-sm text-slate-400 hover:text-white">
          ← Zpět
        </Link>
      </form>
    </main>
  );
}

function QuestionImportPanel({
  testId,
  existingQuestions,
  onClose,
  onSaved,
}: {
  testId: string;
  existingQuestions: Question[];
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const parsed = useMemo(() => parseQuestionImport(value), [value]);
  const existingTexts = useMemo(
    () => new Set(existingQuestions.map((question) => normalizeQuestionSearch(question.text))),
    [existingQuestions]
  );
  const questionsToSave = useMemo(
    () => parsed.questions.filter(
      (question) => !existingTexts.has(normalizeQuestionSearch(question.text))
    ),
    [existingTexts, parsed.questions]
  );
  const duplicateCount = parsed.questions.length - questionsToSave.length;

  const handleSave = async () => {
    if (parsed.errors.length > 0 || questionsToSave.length === 0) return;
    setSaving(true);
    setMessage("");
    try {
      const savedCount = await addQuestionsBatch(testId, questionsToSave);
      await onSaved();
      setValue("");
      setMessage(`Uloženo ${savedCount} otázek.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Otázky se nepodařilo uložit.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 rounded-xl border border-blue-500/40 bg-blue-600/10 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-white">Hromadné vložení otázek</h3>
          <p className="mt-1 text-xs text-slate-400">
            Každá otázka začíná slovem „zadání“. Odpovědi mohou být v libovolném pořadí.
          </p>
        </div>
        <button onClick={onClose} className="text-sm text-slate-400 hover:text-white">
          Zavřít
        </button>
      </div>

      <textarea
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          setMessage("");
        }}
        placeholder={IMPORT_EXAMPLE}
        rows={14}
        className="w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-3 font-mono text-sm text-white outline-none focus:border-blue-500"
      />

      {value.trim() && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-green-600/20 px-2.5 py-1 text-green-300">
              Rozpoznáno: {parsed.questions.length}
            </span>
            {duplicateCount > 0 && (
              <span className="rounded-full bg-amber-500/20 px-2.5 py-1 text-amber-300">
                Již existuje: {duplicateCount} (přeskočí se)
              </span>
            )}
            <span className="rounded-full bg-blue-500/20 px-2.5 py-1 text-blue-300">
              K uložení: {questionsToSave.length}
            </span>
          </div>

          {parsed.errors.length > 0 && (
            <div className="rounded-lg bg-red-600/15 p-3 text-sm text-red-300">
              <p className="mb-1 font-semibold">Import je potřeba opravit:</p>
              <ul className="list-disc space-y-1 pl-5">
                {parsed.errors.map((error, index) => <li key={index}>{error}</li>)}
              </ul>
            </div>
          )}

          {parsed.questions.length > 0 && (
            <div className="rounded-lg bg-slate-900/70 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Náhled prvních otázek
              </p>
              <div className="space-y-2">
                {parsed.questions.slice(0, 3).map((question, index) => (
                  <div key={`${question.text}-${index}`} className="text-xs">
                    <p className="font-medium text-white">{index + 1}. {question.text}</p>
                    <p className="text-green-400">
                      Správně: {question.options[question.correctAnswerIndex]}
                    </p>
                  </div>
                ))}
                {parsed.questions.length > 3 && (
                  <p className="text-xs text-slate-500">+ dalších {parsed.questions.length - 3}</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {message && (
        <p className={`text-sm ${message.startsWith("Uloženo") ? "text-green-400" : "text-red-400"}`}>
          {message}
        </p>
      )}

      <button
        onClick={handleSave}
        disabled={saving || parsed.errors.length > 0 || questionsToSave.length === 0}
        className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {saving ? "Ukládání..." : `Uložit ${questionsToSave.length} otázek`}
      </button>
    </div>
  );
}

function TestsPanel() {
  const [tests, setTests] = useState<TestCategory[]>([]);
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newTestName, setNewTestName] = useState("");
  const [newTestDesc, setNewTestDesc] = useState("");
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [qText, setQText] = useState("");
  const [qOptions, setQOptions] = useState(["", "", ""]);
  const [qCorrect, setQCorrect] = useState(0);
  const [showImport, setShowImport] = useState(false);
  const [questionSearch, setQuestionSearch] = useState("");

  const loadTests = useCallback(async () => {
    await seedDefaultTestIfEmpty();
    const data = await getAllTests();
    setTests(data);
  }, []);

  useEffect(() => {
    loadTests();
  }, [loadTests]);

  const loadQuestions = async (testId: string) => {
    setSelectedTestId(testId);
    const qs = await getQuestionsForTest(testId);
    setQuestions(qs);
    setShowImport(false);
    setQuestionSearch("");
    resetQuestionForm();
  };

  const refreshSelectedTest = async () => {
    if (!selectedTestId) return;
    setQuestions(await getQuestionsForTest(selectedTestId));
    await loadTests();
  };

  const resetQuestionForm = () => {
    setEditingQuestion(null);
    setQText("");
    setQOptions(["", "", ""]);
    setQCorrect(0);
  };

  const handleCreateTest = async () => {
    if (!newTestName.trim()) return;
    await createTest(newTestName.trim(), newTestDesc.trim());
    setNewTestName("");
    setNewTestDesc("");
    await loadTests();
  };

  const handleDeleteTest = async (testId: string) => {
    if (!confirm("Smazat test a všechny otázky?")) return;
    await deleteTest(testId);
    if (selectedTestId === testId) {
      setSelectedTestId(null);
      setQuestions([]);
    }
    await loadTests();
  };

  const handleSaveQuestion = async () => {
    if (!selectedTestId || !qText.trim()) return;
    const options = qOptions.filter((o) => o.trim());
    if (options.length < 2) return;

    const input = { text: qText.trim(), options, correctAnswerIndex: qCorrect };

    if (editingQuestion) {
      await updateQuestion(selectedTestId, editingQuestion.id, input);
    } else {
      await addQuestion(selectedTestId, input);
    }

    resetQuestionForm();
    await refreshSelectedTest();
  };

  const handleEditQuestion = (q: Question) => {
    setEditingQuestion(q);
    setQText(q.text);
    setQOptions([...q.options, "", ""].slice(0, 3));
    setQCorrect(q.correctAnswerIndex);
  };

  const handleDeleteQuestion = async (qId: string) => {
    if (!selectedTestId || !confirm("Smazat otázku?")) return;
    await deleteQuestion(selectedTestId, qId);
    await refreshSelectedTest();
  };

  const filteredQuestions = useMemo(() => {
    const search = normalizeQuestionSearch(questionSearch);
    if (!search) return questions;
    return questions.filter((question) =>
      normalizeQuestionSearch(question.text).includes(search)
    );
  }, [questionSearch, questions]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">Testy</h2>

        <div className="rounded-xl bg-slate-800 p-4 space-y-3">
          <input
            value={newTestName}
            onChange={(e) => setNewTestName(e.target.value)}
            placeholder="Název testu"
            className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white"
          />
          <input
            value={newTestDesc}
            onChange={(e) => setNewTestDesc(e.target.value)}
            placeholder="Popis (volitelné)"
            className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white"
          />
          <button
            onClick={handleCreateTest}
            className="w-full rounded-lg bg-green-600 py-2 text-sm font-semibold text-white hover:bg-green-500"
          >
            + Nový test
          </button>
        </div>

        <div className="space-y-2">
          {tests.map((test) => (
            <div
              key={test.id}
              className={`flex items-center justify-between rounded-xl p-3 ${
                selectedTestId === test.id ? "bg-blue-600/20 ring-1 ring-blue-500" : "bg-slate-800"
              }`}
            >
              <button onClick={() => loadQuestions(test.id)} className="flex-1 text-left">
                <p className="font-semibold text-white">{test.name}</p>
                <p className="text-xs text-slate-400">{test.questionCount ?? 0} otázek</p>
              </button>
              <button
                onClick={() => handleDeleteTest(test.id)}
                className="ml-2 rounded-lg px-2 py-1 text-xs text-red-400 hover:bg-red-600/20"
              >
                Smazat
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-white">
            {selectedTestId ? `Otázky (${questions.length})` : "Vyberte test"}
          </h2>
          {selectedTestId && (
            <button
              onClick={() => setShowImport((visible) => !visible)}
              className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              {showImport ? "Zavřít import" : "Vložit test"}
            </button>
          )}
        </div>

        {selectedTestId && (
          <>
            {showImport && (
              <QuestionImportPanel
                testId={selectedTestId}
                existingQuestions={questions}
                onClose={() => setShowImport(false)}
                onSaved={refreshSelectedTest}
              />
            )}

            <div className="rounded-xl bg-slate-800 p-4 space-y-3">
              <textarea
                value={qText}
                onChange={(e) => setQText(e.target.value)}
                placeholder="Text otázky"
                rows={3}
                className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white"
              />
              {qOptions.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correct"
                    checked={qCorrect === i}
                    onChange={() => setQCorrect(i)}
                    className="accent-blue-500"
                  />
                  <input
                    value={opt}
                    onChange={(e) => {
                      const next = [...qOptions];
                      next[i] = e.target.value;
                      setQOptions(next);
                    }}
                    placeholder={`Odpověď ${String.fromCharCode(65 + i)}`}
                    className="flex-1 rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white"
                  />
                </div>
              ))}
              <div className="flex gap-2">
                <button
                  onClick={handleSaveQuestion}
                  className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-500"
                >
                  {editingQuestion ? "Uložit" : "Přidat otázku"}
                </button>
                {editingQuestion && (
                  <button
                    onClick={resetQuestionForm}
                    className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300"
                  >
                    Zrušit
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <input
                type="search"
                value={questionSearch}
                onChange={(event) => setQuestionSearch(event.target.value)}
                placeholder="Vyhledat zadání v testu..."
                className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500"
              />
              {questionSearch && (
                <p className="text-xs text-slate-500">
                  Nalezeno {filteredQuestions.length} z {questions.length} otázek
                </p>
              )}
            </div>

            <div className="max-h-96 space-y-2 overflow-y-auto">
              {filteredQuestions.map((q, idx) => (
                <div key={q.id} className="rounded-xl bg-slate-800/80 p-3">
                  <p className="text-sm font-medium text-white">
                    {idx + 1}. {q.text}
                  </p>
                  <div className="mt-1 space-y-0.5">
                    {q.options.map((opt, i) => (
                      <p
                        key={i}
                        className={`text-xs ${
                          i === q.correctAnswerIndex ? "text-green-400" : "text-slate-500"
                        }`}
                      >
                        {String.fromCharCode(65 + i)}) {opt}
                        {i === q.correctAnswerIndex && " ✓"}
                      </p>
                    ))}
                  </div>
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => handleEditQuestion(q)}
                      className="text-xs text-blue-400 hover:underline"
                    >
                      Upravit
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="text-xs text-red-400 hover:underline"
                    >
                      Smazat
                    </button>
                  </div>
                </div>
              ))}
              {filteredQuestions.length === 0 && (
                <p className="rounded-xl bg-slate-800/60 p-6 text-center text-sm text-slate-500">
                  Žádné zadání neodpovídá hledání.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function UsersPanel() {
  const [users, setUsers] = useState<AppUser[]>([]);

  const load = useCallback(async () => {
    setUsers(await getAllUsers());
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, [load]);

  return (
    <div>
      <h2 className="mb-4 text-lg font-bold text-white">
        Uživatelé ({users.length})
      </h2>
      <div className="overflow-x-auto rounded-xl bg-slate-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-left text-slate-400">
              <th className="p-3">Email</th>
              <th className="p-3">Stav</th>
              <th className="p-3">Naposledy aktivní</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.uid} className="border-b border-slate-700/50">
                <td className="p-3 text-white">{u.email}</td>
                <td className="p-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs ${
                      u.isOnline
                        ? "bg-green-600/20 text-green-400"
                        : "bg-slate-700 text-slate-400"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        u.isOnline ? "bg-green-400" : "bg-slate-500"
                      }`}
                    />
                    {u.isOnline ? "Online" : "Offline"}
                  </span>
                </td>
                <td className="p-3 text-slate-400">
                  {u.lastSeen.toLocaleString("cs-CZ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <p className="p-6 text-center text-slate-500">Zatím žádní uživatelé</p>
        )}
      </div>
    </div>
  );
}

function AchievementsPanel() {
  const [achievements, setAchievements] = useState<StoredAchievement[]>([]);
  const [form, setForm] = useState({
    id: "",
    title: "",
    description: "",
    emoji: "🏅",
    xpReward: 0,
    condition: "",
  });

  const load = useCallback(async () => {
    await seedDefaultAchievementsIfEmpty();
    setAchievements(await getAllAchievements());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async () => {
    if (!form.id.trim() || !form.title.trim()) return;
    await createAchievement(form);
    setForm({ id: "", title: "", description: "", emoji: "🏅", xpReward: 0, condition: "" });
    await load();
  };

  const handleDelete = async (a: StoredAchievement) => {
    if (!a.firestoreId || a.isDefault) return;
    if (!confirm("Smazat achievement?")) return;
    await deleteAchievement(a.firestoreId);
    await load();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-white">Achievementy</h2>

      <div className="rounded-xl bg-slate-800 p-4 grid gap-3 sm:grid-cols-2">
        <input
          value={form.id}
          onChange={(e) => setForm({ ...form, id: e.target.value })}
          placeholder="ID (např. challenge_win)"
          className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white"
        />
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Název"
          className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white"
        />
        <input
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Popis"
          className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white sm:col-span-2"
        />
        <input
          value={form.emoji}
          onChange={(e) => setForm({ ...form, emoji: e.target.value })}
          placeholder="Emoji"
          className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white"
        />
        <input
          type="number"
          value={form.xpReward}
          onChange={(e) => setForm({ ...form, xpReward: Number(e.target.value) })}
          placeholder="XP odměna"
          className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white"
        />
        <button
          onClick={handleCreate}
          className="rounded-lg bg-green-600 py-2 text-sm font-semibold text-white hover:bg-green-500 sm:col-span-2"
        >
          + Přidat achievement
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {achievements.map((a) => (
          <div key={a.id} className="flex items-start gap-3 rounded-xl bg-slate-800 p-4">
            <span className="text-2xl">{a.emoji}</span>
            <div className="flex-1">
              <p className="font-semibold text-white">{a.title}</p>
              <p className="text-sm text-slate-400">{a.description}</p>
              <p className="mt-1 text-xs text-slate-500">
                ID: {a.id} · +{a.xpReward} XP
                {a.isDefault && " · výchozí"}
              </p>
            </div>
            {!a.isDefault && a.firestoreId && (
              <button
                onClick={() => handleDelete(a)}
                className="text-xs text-red-400 hover:underline"
              >
                Smazat
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ChallengesPanel() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);

  useEffect(() => {
    async function load() {
      const snapshot = await getDocs(
        query(collection(getFirebaseDb(), "challenges"), orderBy("createdAt", "desc"))
      );
      setChallenges(
        snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          const players: Challenge["players"] = {};
          const raw = (data.players as Record<string, Record<string, unknown>>) ?? {};
          for (const [uid, p] of Object.entries(raw)) {
            players[uid] = {
              email: (p.email as string) ?? "",
              joinedAt: (p.joinedAt as { toDate?: () => Date })?.toDate?.() ?? new Date(),
              finished: (p.finished as boolean) ?? false,
              score: p.score as number | undefined,
              passed: p.passed as boolean | undefined,
            };
          }
          return {
            id: docSnap.id,
            code: data.code ?? "",
            creatorId: data.creatorId ?? "",
            creatorEmail: data.creatorEmail ?? "",
            maxPlayers: data.maxPlayers ?? 2,
            testIds: data.testIds ?? [],
            testNames: data.testNames ?? [],
            status: data.status ?? "waiting",
            players,
            questions: data.questions ?? [],
            createdAt: data.createdAt?.toDate?.() ?? new Date(),
          };
        })
      );
    }
    load();
  }, []);

  return (
    <div>
      <h2 className="mb-4 text-lg font-bold text-white">Výzvy ({challenges.length})</h2>
      <div className="space-y-3">
        {challenges.map((c) => {
          const leaderboard = getLeaderboard(c);
          return (
            <div key={c.id} className="rounded-xl bg-slate-800 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">
                    Kód: {c.code} · {c.status}
                  </p>
                  <p className="text-sm text-slate-400">
                    {c.creatorEmail} · {Object.keys(c.players).length}/{c.maxPlayers} hráčů
                  </p>
                  <p className="text-xs text-slate-500">{c.testNames.join(", ")}</p>
                </div>
              </div>
              {leaderboard.length > 0 && (
                <div className="mt-3 space-y-1">
                  {leaderboard.map((p, i) => (
                    <div key={p.uid} className="flex justify-between text-sm">
                      <span className="text-slate-300">
                        {i + 1}. {p.email}
                      </span>
                      <span className={p.passed ? "text-green-400" : "text-red-400"}>
                        {p.finished ? `${p.score}/25` : "..."}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {challenges.length === 0 && (
          <p className="text-center text-slate-500">Zatím žádné výzvy</p>
        )}
      </div>
    </div>
  );
}

function AdminContent() {
  const [authenticated, setAuthenticated] = useState(false);
  const [tab, setTab] = useState<AdminTab>("tests");

  useEffect(() => {
    setAuthenticated(isAdminSession());
  }, []);

  if (!authenticated) {
    return <AdminLogin onLogin={() => setAuthenticated(true)} />;
  }

  const tabs: { id: AdminTab; label: string }[] = [
    { id: "tests", label: "Testy & otázky" },
    { id: "users", label: "Uživatelé" },
    { id: "achievements", label: "Achievementy" },
    { id: "challenges", label: "Výzvy" },
  ];

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin panel</h1>
          <p className="text-sm text-slate-400">Správa testů, uživatelů a výzev</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard" className="rounded-lg bg-slate-700 px-4 py-2 text-sm text-white hover:bg-slate-600">
            Dashboard
          </Link>
          <button
            onClick={() => {
              clearAdminSession();
              setAuthenticated(false);
            }}
            className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:text-white"
          >
            Odhlásit admin
          </button>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              tab === t.id
                ? "bg-blue-600 text-white"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "tests" && <TestsPanel />}
      {tab === "users" && <UsersPanel />}
      {tab === "achievements" && <AchievementsPanel />}
      {tab === "challenges" && <ChallengesPanel />}
    </main>
  );
}

export default function AdminPage() {
  return (
    <ProtectedRoute>
      <AdminContent />
    </ProtectedRoute>
  );
}
