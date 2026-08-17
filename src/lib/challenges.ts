import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  Timestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { getFirebaseDb } from "./firebase";
import type { Question } from "./tests";
import { getQuestionsForTests } from "./tests";
import {
  TEST_QUESTION_COUNT,
  selectRandomQuestionsFromPool,
} from "./test-utils";

export type ChallengeStatus = "waiting" | "countdown" | "active" | "finished";

export interface ChallengePlayer {
  email: string;
  joinedAt: Date;
  finished: boolean;
  score?: number;
  passed?: boolean;
}

export interface ChallengeQuestion {
  id: string;
  testId: string;
  text: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface Challenge {
  id: string;
  code: string;
  creatorId: string;
  creatorEmail: string;
  maxPlayers: number;
  testIds: string[];
  testNames: string[];
  status: ChallengeStatus;
  players: Record<string, ChallengePlayer>;
  questions: ChallengeQuestion[];
  countdownStart?: Date;
  createdAt: Date;
}

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function parseChallenge(id: string, data: Record<string, unknown>): Challenge {
  const players: Record<string, ChallengePlayer> = {};
  const rawPlayers = (data.players as Record<string, Record<string, unknown>>) ?? {};

  for (const [uid, player] of Object.entries(rawPlayers)) {
    players[uid] = {
      email: (player.email as string) ?? "",
      joinedAt: (player.joinedAt as Timestamp)?.toDate?.() ?? new Date(),
      finished: (player.finished as boolean) ?? false,
      score: player.score as number | undefined,
      passed: player.passed as boolean | undefined,
    };
  }

  return {
    id,
    code: (data.code as string) ?? "",
    creatorId: (data.creatorId as string) ?? "",
    creatorEmail: (data.creatorEmail as string) ?? "",
    maxPlayers: (data.maxPlayers as number) ?? 2,
    testIds: (data.testIds as string[]) ?? [],
    testNames: (data.testNames as string[]) ?? [],
    status: (data.status as ChallengeStatus) ?? "waiting",
    players,
    questions: (data.questions as ChallengeQuestion[]) ?? [],
    countdownStart: (data.countdownStart as Timestamp)?.toDate?.(),
    createdAt: (data.createdAt as Timestamp)?.toDate?.() ?? new Date(),
  };
}

function toStoredQuestions(questions: Question[]): ChallengeQuestion[] {
  return questions.map((q) => ({
    id: q.id,
    testId: q.testId,
    text: q.text,
    options: q.options,
    correctAnswerIndex: q.correctAnswerIndex,
  }));
}

export async function createChallenge(
  creatorId: string,
  creatorEmail: string,
  maxPlayers: number,
  testIds: string[],
  testNames: string[]
): Promise<string> {
  if (maxPlayers < 2 || maxPlayers > 8) {
    throw new Error("Počet hráčů musí být mezi 2 a 8");
  }
  if (testIds.length === 0 || testIds.length !== testNames.length) {
    throw new Error("Vyberte alespoň jeden test");
  }

  const ref = await addDoc(collection(getFirebaseDb(), "challenges"), {
    code: generateCode(),
    creatorId,
    creatorEmail,
    maxPlayers,
    testIds,
    testNames,
    status: "waiting",
    players: {
      [creatorId]: {
        email: creatorEmail,
        joinedAt: Timestamp.now(),
        finished: false,
      },
    },
    questions: [],
    createdAt: Timestamp.now(),
  });
  return ref.id;
}

export async function getChallenge(challengeId: string): Promise<Challenge | null> {
  const snap = await getDoc(doc(getFirebaseDb(), "challenges", challengeId));
  if (!snap.exists()) return null;
  return parseChallenge(snap.id, snap.data());
}

export async function getPublicChallenges(): Promise<Challenge[]> {
  const snapshot = await getDocs(
    query(collection(getFirebaseDb(), "challenges"), orderBy("createdAt", "desc"))
  );

  return snapshot.docs
    .map((docSnap) => parseChallenge(docSnap.id, docSnap.data()))
    .filter((c) => ["waiting", "countdown", "active"].includes(c.status));
}

export function subscribeToChallenge(
  challengeId: string,
  callback: (challenge: Challenge | null) => void
): Unsubscribe {
  return onSnapshot(doc(getFirebaseDb(), "challenges", challengeId), (snap) => {
    if (!snap.exists()) {
      callback(null);
      return;
    }
    callback(parseChallenge(snap.id, snap.data()));
  });
}

export async function joinChallenge(
  challengeId: string,
  userId: string,
  email: string
): Promise<void> {
  const challengeRef = doc(getFirebaseDb(), "challenges", challengeId);

  await runTransaction(getFirebaseDb(), async (transaction) => {
    const snapshot = await transaction.get(challengeRef);
    if (!snapshot.exists()) throw new Error("Výzva neexistuje");

    const challenge = parseChallenge(snapshot.id, snapshot.data());
    if (challenge.players[userId]) return;
    if (challenge.status !== "waiting") throw new Error("Výzva již začala");
    if (Object.keys(challenge.players).length >= challenge.maxPlayers) {
      throw new Error("Výzva je plná");
    }

    transaction.update(challengeRef, {
      [`players.${userId}`]: {
        email,
        joinedAt: Timestamp.now(),
        finished: false,
      },
    });
  });
}

export async function startChallengeCountdown(challengeId: string): Promise<void> {
  const challenge = await getChallenge(challengeId);
  if (!challenge) throw new Error("Výzva neexistuje");
  if (challenge.status !== "waiting") return;

  const playerCount = Object.keys(challenge.players).length;
  if (playerCount !== challenge.maxPlayers) {
    throw new Error(`Čeká se na všechny hráče (${playerCount}/${challenge.maxPlayers})`);
  }

  const pool = await getQuestionsForTests(challenge.testIds);
  if (pool.length < TEST_QUESTION_COUNT) {
    throw new Error(`Vybraná témata musí obsahovat alespoň ${TEST_QUESTION_COUNT} otázek`);
  }
  const selected = selectRandomQuestionsFromPool(pool, TEST_QUESTION_COUNT);

  const challengeRef = doc(getFirebaseDb(), "challenges", challengeId);
  await runTransaction(getFirebaseDb(), async (transaction) => {
    const snapshot = await transaction.get(challengeRef);
    if (!snapshot.exists()) throw new Error("Výzva neexistuje");
    const current = parseChallenge(snapshot.id, snapshot.data());
    if (current.status !== "waiting") return;
    if (Object.keys(current.players).length !== current.maxPlayers) {
      throw new Error("Čeká se na všechny hráče");
    }
    transaction.update(challengeRef, {
      status: "countdown",
      countdownStart: Timestamp.now(),
      questions: toStoredQuestions(selected),
    });
  });
}

export async function activateChallenge(challengeId: string): Promise<void> {
  const challengeRef = doc(getFirebaseDb(), "challenges", challengeId);
  await runTransaction(getFirebaseDb(), async (transaction) => {
    const snapshot = await transaction.get(challengeRef);
    if (!snapshot.exists() || snapshot.data().status !== "countdown") return;
    transaction.update(challengeRef, { status: "active" });
  });
}

export async function submitChallengeResult(
  challengeId: string,
  userId: string,
  score: number,
  passed: boolean
): Promise<void> {
  const challengeRef = doc(getFirebaseDb(), "challenges", challengeId);
  await runTransaction(getFirebaseDb(), async (transaction) => {
    const snapshot = await transaction.get(challengeRef);
    if (!snapshot.exists()) throw new Error("Výzva neexistuje");

    const challenge = parseChallenge(snapshot.id, snapshot.data());
    if (!challenge.players[userId]) throw new Error("Nejste hráčem této výzvy");
    if (challenge.status !== "active") return;

    const safeScore = Math.max(0, Math.min(TEST_QUESTION_COUNT, Math.round(score)));
    const players = {
      ...challenge.players,
      [userId]: {
        ...challenge.players[userId],
        finished: true,
        score: safeScore,
        passed,
      },
    };
    const allFinished = Object.values(players).every((player) => player.finished);

    transaction.update(challengeRef, {
      [`players.${userId}.finished`]: true,
      [`players.${userId}.score`]: safeScore,
      [`players.${userId}.passed`]: passed,
      ...(allFinished ? { status: "finished" } : {}),
    });
  });
}

export function getLeaderboard(challenge: Challenge) {
  return Object.entries(challenge.players)
    .map(([uid, player]) => ({
      uid,
      email: player.email,
      score: player.score ?? 0,
      passed: player.passed ?? false,
      finished: player.finished,
    }))
    .sort((a, b) => b.score - a.score);
}
