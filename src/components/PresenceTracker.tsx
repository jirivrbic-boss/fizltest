"use client";

import { useAuth } from "@/context/AuthContext";
import { setOffline, updatePresence, upsertUser } from "@/lib/users";
import { useEffect } from "react";

const HEARTBEAT_INTERVAL = 60_000;

export function PresenceTracker() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.email) return;

    upsertUser(user.uid, user.email);

    const heartbeat = setInterval(() => {
      updatePresence(user.uid, user.email!);
    }, HEARTBEAT_INTERVAL);

    const handleUnload = () => {
      setOffline(user.uid);
    };

    window.addEventListener("beforeunload", handleUnload);

    return () => {
      clearInterval(heartbeat);
      window.removeEventListener("beforeunload", handleUnload);
      setOffline(user.uid);
    };
  }, [user]);

  return null;
}
