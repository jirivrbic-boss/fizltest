import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { getFirebaseDb } from "./firebase";

export interface AppUser {
  uid: string;
  email: string;
  createdAt: Date;
  lastSeen: Date;
  isOnline: boolean;
}

export async function upsertUser(uid: string, email: string): Promise<void> {
  const ref = doc(getFirebaseDb(), "users", uid);
  const now = Timestamp.now();

  await setDoc(
    ref,
    {
      email,
      lastSeen: now,
      isOnline: true,
      createdAt: now,
    },
    { merge: true }
  );
}

export async function updatePresence(uid: string, email: string): Promise<void> {
  await setDoc(
    doc(getFirebaseDb(), "users", uid),
    {
      email,
      lastSeen: Timestamp.now(),
      isOnline: true,
    },
    { merge: true }
  );
}

export async function setOffline(uid: string): Promise<void> {
  await setDoc(
    doc(getFirebaseDb(), "users", uid),
    {
      isOnline: false,
      lastSeen: Timestamp.now(),
    },
    { merge: true }
  );
}

export async function getAllUsers(): Promise<AppUser[]> {
  const snapshot = await getDocs(
    query(collection(getFirebaseDb(), "users"), orderBy("lastSeen", "desc"))
  );

  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;

  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    const lastSeen = data.lastSeen?.toDate?.() ?? new Date();
    return {
      uid: docSnap.id,
      email: data.email ?? "",
      createdAt: data.createdAt?.toDate?.() ?? lastSeen,
      lastSeen,
      isOnline: data.isOnline === true && lastSeen.getTime() > fiveMinutesAgo,
    };
  });
}
