import type { AppDataMode } from "@/types/settings";

export const queryKeys = {
  hero: ["tmdb", "hero"] as const,
  list: (scope: string, values: Record<string, string | number | null | undefined>) =>
    ["tmdb", scope, JSON.stringify(values)] as const,
  details: (mediaType: string, id: string) => ["tmdb", "details", mediaType, id] as const,
  season: (id: string, season: number) => ["tmdb", "season", id, season] as const,
  trailer: (mediaType: string, id: string) => ["tmdb", "trailer", mediaType, id] as const,
  genres: (mediaType: string) => ["tmdb", "genres", mediaType] as const,
  settings: (mode: AppDataMode, uid?: string | null) => ["user", mode, uid ?? "guest", "settings"] as const,
  watchlist: (mode: AppDataMode, uid?: string | null) => ["user", mode, uid ?? "guest", "watchlist"] as const,
  continueWatching: (mode: AppDataMode, uid?: string | null) =>
    ["user", mode, uid ?? "guest", "continue-watching"] as const,
  progress: (mode: AppDataMode, uid: string | null | undefined, mediaId: string) =>
    ["user", mode, uid ?? "guest", "progress", mediaId] as const,
};
