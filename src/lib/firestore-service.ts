import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  where,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

// --- Settings ---
export interface UserSettings {
  theme: "dark" | "light" | "system";
  autoplay: boolean;
  autoNextEpisode: boolean;
  blockPopups: boolean;
  notifications: boolean;
}

const DEFAULT_SETTINGS: UserSettings = {
  theme: "dark",
  autoplay: true,
  autoNextEpisode: true,
  blockPopups: false,
  notifications: false,
};

export async function getSettings(userId: string): Promise<UserSettings> {
  const snap = await getDoc(doc(db, "users", userId, "settings", "prefs"));
  if (!snap.exists()) return DEFAULT_SETTINGS;
  return { ...DEFAULT_SETTINGS, ...snap.data() } as UserSettings;
}

export async function saveSettings(userId: string, settings: Partial<UserSettings>): Promise<UserSettings> {
  const ref = doc(db, "users", userId, "settings", "prefs");
  await setDoc(ref, settings, { merge: true });
  return getSettings(userId);
}

// --- Watchlist ---
export interface WatchlistItem {
  mediaId: string;
  mediaType: string;
  title: string;
  posterPath?: string | null;
  rating?: number | null;
  addedAt?: string;
}

export async function getWatchlist(userId: string): Promise<{ items: WatchlistItem[]; total: number }> {
  const col = collection(db, "users", userId, "watchlist");
  const snap = await getDocs(query(col, orderBy("addedAt", "desc")));
  const items: WatchlistItem[] = snap.docs.map((d) => {
    const data = d.data();
    return {
      mediaId: d.id,
      mediaType: data.mediaType,
      title: data.title,
      posterPath: data.posterPath ?? null,
      rating: data.rating ?? null,
      addedAt: data.addedAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
    };
  });
  return { items, total: items.length };
}

export async function addToWatchlist(userId: string, item: Omit<WatchlistItem, "addedAt">) {
  const ref = doc(db, "users", userId, "watchlist", item.mediaId);
  await setDoc(ref, { ...item, addedAt: serverTimestamp() });
}

export async function removeFromWatchlist(userId: string, mediaId: string) {
  await deleteDoc(doc(db, "users", userId, "watchlist", mediaId));
}

export async function isInWatchlist(userId: string, mediaId: string): Promise<boolean> {
  const snap = await getDoc(doc(db, "users", userId, "watchlist", mediaId));
  return snap.exists();
}

// --- Watch History ---
export interface WatchHistoryItem {
  mediaId: string;
  mediaType: string;
  title: string;
  posterPath?: string | null;
  watchedAt: string;
  progress?: number | null;
  season?: number | null;
  episode?: number | null;
}

export async function getWatchHistory(userId: string, limitCount = 20): Promise<{ items: WatchHistoryItem[]; total: number }> {
  const col = collection(db, "users", userId, "history");
  const snap = await getDocs(query(col, orderBy("watchedAt", "desc"), limit(limitCount)));
  const items: WatchHistoryItem[] = snap.docs.map((d) => {
    const data = d.data();
    return {
      mediaId: d.id,
      mediaType: data.mediaType,
      title: data.title,
      posterPath: data.posterPath ?? null,
      watchedAt: data.watchedAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
      progress: data.progress ?? null,
      season: data.season ?? null,
      episode: data.episode ?? null,
    };
  });
  return { items, total: items.length };
}

// --- Playback Progress ---
export interface PlaybackProgress {
  mediaId: string;
  mediaType: string;
  currentTime: number;
  duration: number;
  progress: number;
  season?: number | null;
  episode?: number | null;
  title?: string | null;
  posterPath?: string | null;
  backdropPath?: string | null;
  updatedAt: string;
}

export async function getProgress(userId: string, mediaId: string): Promise<PlaybackProgress | null> {
  const snap = await getDoc(doc(db, "users", userId, "progress", mediaId));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    mediaId,
    mediaType: data.mediaType,
    currentTime: data.currentTime ?? 0,
    duration: data.duration ?? 0,
    progress: data.progress ?? 0,
    season: data.season ?? null,
    episode: data.episode ?? null,
    title: data.title ?? null,
    posterPath: data.posterPath ?? null,
    backdropPath: data.backdropPath ?? null,
    updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
  };
}

export async function saveProgress(
  userId: string,
  mediaId: string,
  data: {
    mediaType: string;
    currentTime: number;
    duration: number;
    progress: number;
    season?: number | null;
    episode?: number | null;
    title?: string | null;
    posterPath?: string | null;
    backdropPath?: string | null;
  }
) {
  const ref = doc(db, "users", userId, "progress", mediaId);
  await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true });

  // Track history at >10%
  if (data.progress > 10 && data.title) {
    const histRef = doc(db, "users", userId, "history", mediaId);
    await setDoc(
      histRef,
      {
        mediaType: data.mediaType,
        title: data.title,
        posterPath: data.posterPath ?? null,
        progress: data.progress,
        season: data.season ?? null,
        episode: data.episode ?? null,
        watchedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }
}

export async function getContinueWatching(userId: string): Promise<PlaybackProgress[]> {
  const col = collection(db, "users", userId, "progress");
  const snap = await getDocs(query(col, orderBy("updatedAt", "desc"), limit(20)));
  return snap.docs
    .map((d) => {
      const data = d.data();
      return {
        mediaId: d.id,
        mediaType: data.mediaType,
        currentTime: data.currentTime ?? 0,
        duration: data.duration ?? 0,
        progress: data.progress ?? 0,
        season: data.season ?? null,
        episode: data.episode ?? null,
        title: data.title ?? null,
        posterPath: data.posterPath ?? null,
        backdropPath: data.backdropPath ?? null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
      } as PlaybackProgress;
    })
    .filter((p) => p.progress > 0 && p.progress < 95);
}

// localStorage fallback helpers
const LS_SETTINGS_KEY = "gx_settings";

export function getLocalSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(LS_SETTINGS_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_SETTINGS;
}

export function saveLocalSettings(settings: Partial<UserSettings>) {
  try {
    const existing = getLocalSettings();
    localStorage.setItem(LS_SETTINGS_KEY, JSON.stringify({ ...existing, ...settings }));
  } catch {}
}
