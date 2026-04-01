"use client";

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import type { QueryClient } from "@tanstack/react-query";

import { getFirestoreDb } from "@/lib/firebase/client";
import {
  DEFAULT_SETTINGS,
  GUEST_HISTORY_KEY,
  GUEST_PROGRESS_KEY,
  GUEST_SETTINGS_KEY,
  GUEST_WATCHLIST_KEY,
} from "@/lib/settings";
import type { DataLayer, PlaybackProgress, WatchlistItem } from "@/types/data-layer";
import type { AppDataMode, Settings, SettingsScope } from "@/types/settings";

const readLocalJson = <T>(key: string, fallback: T): T => {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const writeLocalJson = <T>(key: string, value: T) => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(key, JSON.stringify(value));
};

const normalizeSettings = (input?: Partial<Settings>): Settings => ({
  guestMode: input?.guestMode ?? DEFAULT_SETTINGS.guestMode,
  allowPopups: false,
  autoplayTrailers: input?.autoplayTrailers ?? DEFAULT_SETTINGS.autoplayTrailers,
  enableAnimations: input?.enableAnimations ?? DEFAULT_SETTINGS.enableAnimations,
  dataSaver: input?.dataSaver ?? DEFAULT_SETTINGS.dataSaver,
});

const normalizeWatchlistSnapshot = (snapshot: QueryDocumentSnapshot[]) =>
  snapshot.map((item) => {
    const data = item.data() as Record<string, unknown>;
    return {
      mediaId: item.id,
      mediaType: String(data.mediaType ?? "movie") as WatchlistItem["mediaType"],
      title: String(data.title ?? "Untitled"),
      posterPath: typeof data.posterPath === "string" ? data.posterPath : null,
      backdropPath: typeof data.backdropPath === "string" ? data.backdropPath : null,
      rating: typeof data.rating === "number" ? data.rating : null,
      addedAt:
        typeof (data.addedAt as { toDate?: () => Date } | undefined)?.toDate === "function"
          ? (data.addedAt as { toDate: () => Date }).toDate().toISOString()
          : new Date().toISOString(),
    } satisfies WatchlistItem;
  });

const normalizeProgressSnapshot = (snapshot: QueryDocumentSnapshot[]) =>
  snapshot
    .map((item) => {
      const data = item.data() as Record<string, unknown>;
      return {
        mediaId: item.id,
        mediaType: String(data.mediaType ?? "movie") as PlaybackProgress["mediaType"],
        title: String(data.title ?? "Untitled"),
        posterPath: typeof data.posterPath === "string" ? data.posterPath : null,
        backdropPath: typeof data.backdropPath === "string" ? data.backdropPath : null,
        season: typeof data.season === "number" ? data.season : null,
        episode: typeof data.episode === "number" ? data.episode : null,
        currentTime: typeof data.currentTime === "number" ? data.currentTime : 0,
        duration: typeof data.duration === "number" ? data.duration : 0,
        progress: typeof data.progress === "number" ? data.progress : 0,
        updatedAt:
          typeof (data.updatedAt as { toDate?: () => Date } | undefined)?.toDate === "function"
            ? (data.updatedAt as { toDate: () => Date }).toDate().toISOString()
            : new Date().toISOString(),
      } satisfies PlaybackProgress;
    })
    .filter((item) => item.progress > 0 && item.progress < 95)
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));

const getGuestWatchlist = () => readLocalJson<WatchlistItem[]>(GUEST_WATCHLIST_KEY, []);
const getGuestProgressMap = () => readLocalJson<Record<string, PlaybackProgress>>(GUEST_PROGRESS_KEY, {});

const ensureAccountScope = (scope: SettingsScope) => {
  if (scope.mode !== "account") {
    throw new Error("This operation requires an authenticated account scope.");
  }
  return scope.uid;
};

export const dataLayer: DataLayer = {
  async loadSettings(scope) {
    if (scope.mode === "guest") {
      return normalizeSettings(readLocalJson<Settings>(GUEST_SETTINGS_KEY, DEFAULT_SETTINGS));
    }

    const uid = ensureAccountScope(scope);
    const snapshot = await getDoc(doc(getFirestoreDb(), "users", uid, "settings", "prefs"));
    return normalizeSettings(snapshot.exists() ? (snapshot.data() as Partial<Settings>) : DEFAULT_SETTINGS);
  },

  async saveSettings(scope, settings) {
    const nextSettings = normalizeSettings(settings);
    if (scope.mode === "guest") {
      writeLocalJson(GUEST_SETTINGS_KEY, nextSettings);
      return nextSettings;
    }

    const uid = ensureAccountScope(scope);
    await setDoc(doc(getFirestoreDb(), "users", uid, "settings", "prefs"), nextSettings, { merge: true });
    return nextSettings;
  },

  subscribeWatchlist(scope, onChange) {
    if (scope.mode === "guest") {
      onChange(getGuestWatchlist());
      return () => undefined;
    }

    const uid = ensureAccountScope(scope);
    const watchlistQuery = query(
      collection(getFirestoreDb(), "users", uid, "watchlist"),
      orderBy("addedAt", "desc"),
    );
    return onSnapshot(watchlistQuery, (snapshot) => onChange(normalizeWatchlistSnapshot(snapshot.docs)));
  },

  subscribeContinueWatching(scope, onChange) {
    if (scope.mode === "guest") {
      const guestItems = Object.values(getGuestProgressMap()).sort((left, right) =>
        right.updatedAt.localeCompare(left.updatedAt),
      );
      onChange(guestItems.filter((item) => item.progress > 0 && item.progress < 95));
      return () => undefined;
    }

    const uid = ensureAccountScope(scope);
    const progressQuery = query(
      collection(getFirestoreDb(), "users", uid, "progress"),
      orderBy("updatedAt", "desc"),
    );
    return onSnapshot(progressQuery, (snapshot) => onChange(normalizeProgressSnapshot(snapshot.docs)));
  },

  async getPlaybackProgress(scope, mediaId) {
    if (scope.mode === "guest") {
      return getGuestProgressMap()[mediaId] ?? null;
    }

    const uid = ensureAccountScope(scope);
    const snapshot = await getDoc(doc(getFirestoreDb(), "users", uid, "progress", mediaId));
    if (!snapshot.exists()) {
      return null;
    }

    const data = snapshot.data() as Record<string, unknown>;
    return {
      mediaId,
      mediaType: String(data.mediaType ?? "movie") as PlaybackProgress["mediaType"],
      title: String(data.title ?? "Untitled"),
      posterPath: typeof data.posterPath === "string" ? data.posterPath : null,
      backdropPath: typeof data.backdropPath === "string" ? data.backdropPath : null,
      season: typeof data.season === "number" ? data.season : null,
      episode: typeof data.episode === "number" ? data.episode : null,
      currentTime: typeof data.currentTime === "number" ? data.currentTime : 0,
      duration: typeof data.duration === "number" ? data.duration : 0,
      progress: typeof data.progress === "number" ? data.progress : 0,
      updatedAt:
        typeof (data.updatedAt as { toDate?: () => Date } | undefined)?.toDate === "function"
          ? (data.updatedAt as { toDate: () => Date }).toDate().toISOString()
          : new Date().toISOString(),
    };
  },

  async savePlaybackProgress(scope, input) {
    const record: PlaybackProgress = {
      mediaId: input.mediaId,
      mediaType: input.mediaType,
      title: input.title,
      posterPath: input.posterPath,
      backdropPath: input.backdropPath,
      season: input.season ?? null,
      episode: input.episode ?? null,
      currentTime: input.currentTime,
      duration: input.duration,
      progress: input.progress,
      updatedAt: new Date().toISOString(),
    };

    if (scope.mode === "guest") {
      const progressMap = getGuestProgressMap();
      progressMap[input.mediaId] = record;
      writeLocalJson(GUEST_PROGRESS_KEY, progressMap);
      writeLocalJson(
        GUEST_HISTORY_KEY,
        Object.values(progressMap).sort((left, right) => right.updatedAt.localeCompare(left.updatedAt)),
      );
      return;
    }

    const uid = ensureAccountScope(scope);
    await setDoc(
      doc(getFirestoreDb(), "users", uid, "progress", input.mediaId),
      {
        ...record,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
    await setDoc(
      doc(getFirestoreDb(), "users", uid, "history", input.mediaId),
      {
        mediaType: input.mediaType,
        title: input.title,
        posterPath: input.posterPath,
        progress: input.progress,
        season: input.season ?? null,
        episode: input.episode ?? null,
        watchedAt: serverTimestamp(),
      },
      { merge: true },
    );
  },

  async toggleWatchlist(scope, item) {
    if (scope.mode === "guest") {
      const watchlist = getGuestWatchlist();
      const existingIndex = watchlist.findIndex((entry) => entry.mediaId === item.mediaId);
      if (existingIndex >= 0) {
        watchlist.splice(existingIndex, 1);
        writeLocalJson(GUEST_WATCHLIST_KEY, watchlist);
        return { saved: false, items: watchlist };
      }

      const nextItems = [{ ...item, addedAt: new Date().toISOString() }, ...watchlist];
      writeLocalJson(GUEST_WATCHLIST_KEY, nextItems);
      return { saved: true, items: nextItems };
    }

    const uid = ensureAccountScope(scope);
    const reference = doc(getFirestoreDb(), "users", uid, "watchlist", item.mediaId);
    const snapshot = await getDoc(reference);
    if (snapshot.exists()) {
      await deleteDoc(reference);
      return { saved: false };
    }

    await setDoc(reference, {
      ...item,
      addedAt: serverTimestamp(),
    });
    return { saved: true };
  },

  clearModeScopedCache(queryClient: QueryClient, mode: AppDataMode) {
    queryClient.removeQueries({ queryKey: ["user", mode] });
    queryClient.removeQueries({ queryKey: ["user", mode === "guest" ? "account" : "guest"] });
  },
};
