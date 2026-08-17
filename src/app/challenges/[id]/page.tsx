"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import TestInterface from "@/components/TestInterface";
import { useAuth } from "@/context/AuthContext";
import {
  activateChallenge,
  getLeaderboard,
  joinChallenge,
  startChallengeCountdown,
  subscribeToChallenge,
  type Challenge,
} from "@/lib/challenges";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const COUNTDOWN_SECONDS = 5;

function Leaderboard({ challenge }: { challenge: Challenge }) {
  const leaderboard = getLeaderboard(challenge);
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-purple-600/20 text-4xl">
          🏆
        </div>
        <h2 className="text-2xl font-bold text-white">Stupínek vítězů</h2>
        <p className="mt-2 text-slate-400">Výzva {challenge.code}</p>
      </div>

      <div className="space-y-3">
        {leaderboard.map((player, index) => (
          <div
            key={player.uid}
            className={`flex items-center justify-between rounded-xl p-4 ${
              index === 0
                ? "bg-amber-500/20 ring-2 ring-amber-500/50"
                : index === 1
                  ? "bg-slate-400/10 ring-1 ring-slate-400/30"
                  : index === 2
                    ? "bg-orange-600/10 ring-1 ring-orange-600/30"
                    : "bg-slate-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{medals[index] ?? `${index + 1}.`}</span>
              <div>
                <p className="font-semibold text-white">{player.email}</p>
                <p className={`text-sm ${player.passed ? "text-green-400" : "text-red-400"}`}>
                  {player.passed ? "Úspěch" : "Neúspěch"}
                </p>
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{player.score}/25</p>
          </div>
        ))}
      </div>

      <Link
        href="/challenges"
        className="block w-full rounded-xl bg-purple-600 py-4 text-center font-semibold text-white hover:bg-purple-500"
      >
        Zpět na výzvy
      </Link>
    </div>
  );
}

function WaitingRoom({
  challenge,
  userId,
  onStart,
  starting,
}: {
  challenge: Challenge;
  userId: string;
  onStart: () => void;
  starting: boolean;
}) {
  const players = Object.entries(challenge.players);
  const isCreator = challenge.creatorId === userId;
  const canStart = players.length === challenge.maxPlayers && isCreator;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-600/20 text-3xl animate-pulse">
          ⏳
        </div>
        <h2 className="text-xl font-bold text-white">Waiting room</h2>
        <p className="mt-2 font-mono text-2xl text-purple-400">{challenge.code}</p>
        <p className="mt-1 text-sm text-slate-400">
          Sdílej kód nebo nech ostatní kliknout na výzvu v seznamu
        </p>
      </div>

      <div className="rounded-xl bg-slate-800 p-4">
        <p className="mb-3 text-sm font-semibold text-slate-400">
          Hráči ({players.length}/{challenge.maxPlayers})
        </p>
        <div className="space-y-2">
          {players.map(([uid, player]) => (
            <div
              key={uid}
              className="flex items-center justify-between rounded-lg bg-slate-900/50 px-3 py-2"
            >
              <span className="text-white">{player.email}</span>
              {uid === challenge.creatorId && (
                <span className="text-xs text-purple-400">Hostitel</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-slate-800/50 p-3 text-center text-sm text-slate-400">
        Témata: {challenge.testNames.join(", ")}
      </div>

      {isCreator && (
        <button
          onClick={onStart}
          disabled={!canStart || starting}
          className="w-full rounded-xl bg-purple-600 py-4 font-semibold text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {starting
            ? "Spouštím..."
            : canStart
              ? "Spustit výzvu!"
              : `Čeká se na hráče (${players.length}/${challenge.maxPlayers})`}
        </button>
      )}

      {!isCreator && (
        <p className="text-center text-sm text-slate-400">
          Čeká se, až hostitel spustí výzvu...
        </p>
      )}
    </div>
  );
}

function CountdownView({ challenge }: { challenge: Challenge }) {
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);

  useEffect(() => {
    if (!challenge.countdownStart) return;

    const elapsed = Math.floor(
      (Date.now() - challenge.countdownStart.getTime()) / 1000
    );
    const remaining = Math.max(0, COUNTDOWN_SECONDS - elapsed);
    setSecondsLeft(remaining);

    if (remaining <= 0) {
      activateChallenge(challenge.id);
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          activateChallenge(challenge.id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [challenge.id, challenge.countdownStart]);

  return (
    <div className="py-20 text-center">
      <p className="text-lg text-slate-400">Výzva začíná za</p>
      <p className="mt-4 text-8xl font-bold text-purple-400">{secondsLeft || "GO!"}</p>
    </div>
  );
}

function ChallengeContent() {
  const params = useParams();
  const { user } = useAuth();
  const challengeId = params.id as string;
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [joined, setJoined] = useState(false);
  const [roomError, setRoomError] = useState("");

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToChallenge(challengeId, (data) => {
      setChallenge(data);
      setLoading(false);

      if (data && user && data.players[user.uid]) {
        setJoined(true);
      }
    });

    return unsubscribe;
  }, [challengeId, user]);

  useEffect(() => {
    if (!user?.email || !challenge || joined) return;
    if (challenge.status !== "waiting") return;
    if (challenge.players[user.uid]) {
      setJoined(true);
      return;
    }

    joinChallenge(challengeId, user.uid, user.email)
      .then(() => setJoined(true))
      .catch((error: unknown) => {
        setRoomError(error instanceof Error ? error.message : "Do výzvy se nepodařilo připojit");
      });
  }, [user, challenge, challengeId, joined]);

  useEffect(() => {
    if (!challenge || challenge.status !== "waiting" || starting) return;
    if (Object.keys(challenge.players).length !== challenge.maxPlayers) return;

    setStarting(true);
    startChallengeCountdown(challengeId)
      .catch((error: unknown) => {
        setRoomError(error instanceof Error ? error.message : "Výzvu se nepodařilo spustit");
      })
      .finally(() => setStarting(false));
  }, [challenge, challengeId, starting]);

  const handleStart = useCallback(async () => {
    setStarting(true);
    try {
      await startChallengeCountdown(challengeId);
    } catch (error) {
      setRoomError(error instanceof Error ? error.message : "Výzvu se nepodařilo spustit");
    } finally {
      setStarting(false);
    }
  }, [challengeId]);

  if (loading) {
    return <div className="py-20 text-center text-slate-400">Načítání roomky...</div>;
  }

  if (!challenge) {
    return (
      <div className="py-20 text-center">
        <p className="text-red-400">Výzva neexistuje</p>
        <Link href="/challenges" className="mt-4 inline-block text-purple-400 hover:underline">
          Zpět
        </Link>
      </div>
    );
  }

  if (roomError && !challenge.players[user?.uid ?? ""]) {
    return (
      <div className="py-20 text-center">
        <p className="text-red-400">{roomError}</p>
        <Link href="/challenges" className="mt-4 inline-block text-purple-400 hover:underline">
          Zpět na výzvy
        </Link>
      </div>
    );
  }

  if (challenge.status === "finished") {
    return <Leaderboard challenge={challenge} />;
  }

  if (challenge.status === "countdown") {
    return <CountdownView challenge={challenge} />;
  }

  if (challenge.status === "active") {
    const questions = challenge.questions.map((q) => ({
      id: q.id,
      testId: q.testId,
      text: q.text,
      options: q.options,
      correctAnswerIndex: q.correctAnswerIndex,
    }));

    const userFinished = user ? challenge.players[user.uid]?.finished : false;

    if (userFinished) {
      const allFinished = Object.values(challenge.players).every((p) => p.finished);
      if (allFinished) {
        return <Leaderboard challenge={challenge} />;
      }

      return (
        <div className="py-20 text-center">
          <div className="mx-auto mb-4 text-4xl">⏳</div>
          <h2 className="text-xl font-bold text-white">Test dokončen!</h2>
          <p className="mt-2 text-slate-400">Čeká se na ostatní hráče...</p>
          <p className="mt-4 text-3xl font-bold text-white">
            {challenge.players[user!.uid]?.score ?? 0} / 25
          </p>
        </div>
      );
    }

    if (questions.length === 0) {
      return <div className="py-20 text-center text-slate-400">Příprava otázek...</div>;
    }

    return (
      <TestInterface
        questions={questions}
        challengeId={challengeId}
      />
    );
  }

  return (
    <>
      {roomError && (
        <p className="mb-4 rounded-xl bg-red-600/15 p-3 text-center text-sm text-red-300">
          {roomError}
        </p>
      )}
      <WaitingRoom
        challenge={challenge}
        userId={user!.uid}
        onStart={handleStart}
        starting={starting}
      />
    </>
  );
}

export default function ChallengeRoomPage() {
  return (
    <ProtectedRoute>
      <main className="mx-auto min-h-screen max-w-2xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/challenges" className="text-sm text-slate-400 hover:text-white">
            ← Výzvy
          </Link>
          <h1 className="text-lg font-bold text-white">Výzva</h1>
          <div className="w-16" />
        </div>

        <ChallengeContent />
      </main>
    </ProtectedRoute>
  );
}
