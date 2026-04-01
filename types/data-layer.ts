import type { QueryClient } from "@tanstack/react-query";

import type { MediaType } from "@/types/media";
import type { AppDataMode, Settings, SettingsScope } from "@/types/settings";

export type WatchlistItem = {
  mediaId: string;
  mediaType: MediaType;
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  rating: number | null;
  addedAt: string;
};

export type PlaybackProgress = {
  mediaId: string;
  mediaType: MediaType;
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  season: number | null;
  episode: number | null;
  currentTime: number;
  duration: number;
  progress: number;
  updatedAt: string;
};

export type SavePlaybackProgressInput = {
  mediaId: string;
  mediaType: MediaType;
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  season?: number | null;
  episode?: number | null;
  currentTime: number;
  duration: number;
  progress: number;
};

export interface DataLayer {
  loadSettings(scope: SettingsScope): Promise<Settings>;
  saveSettings(scope: SettingsScope, settings: Partial<Settings>): Promise<Settings>;
  subscribeWatchlist(scope: SettingsScope, onChange: (items: WatchlistItem[]) => void): () => void;
  subscribeContinueWatching(scope: SettingsScope, onChange: (items: PlaybackProgress[]) => void): () => void;
  getPlaybackProgress(scope: SettingsScope, mediaId: string): Promise<PlaybackProgress | null>;
  savePlaybackProgress(scope: SettingsScope, input: SavePlaybackProgressInput): Promise<void>;
  toggleWatchlist(
    scope: SettingsScope,
    item: Omit<WatchlistItem, "addedAt">,
  ): Promise<{ saved: boolean; items?: WatchlistItem[] }>;
  clearModeScopedCache(queryClient: QueryClient, mode: AppDataMode): void;
}
