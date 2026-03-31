import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import {
  getSettings,
  saveSettings,
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  getWatchHistory,
  getProgress,
  saveProgress,
  getContinueWatching,
  getLocalSettings,
  saveLocalSettings,
  type UserSettings,
  type WatchlistItem,
} from "@/lib/firestore-service";

const userKeys = {
  settings: (uid: string | undefined) => ["user", uid, "settings"] as const,
  watchlist: (uid: string | undefined) => ["user", uid, "watchlist"] as const,
  history: (uid: string | undefined) => ["user", uid, "history"] as const,
  progress: (uid: string | undefined, mediaId: string) => ["user", uid, "progress", mediaId] as const,
  continueWatching: (uid: string | undefined) => ["user", uid, "continueWatching"] as const,
};

export function useSettings() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: userKeys.settings(user?.id),
    queryFn: () => user ? getSettings(user.id) : Promise.resolve(getLocalSettings()),
    staleTime: 60 * 1000,
  });

  const mutation = useMutation({
    mutationFn: async (settings: Partial<UserSettings>) => {
      if (user) {
        return saveSettings(user.id, settings);
      } else {
        saveLocalSettings(settings);
        return { ...getLocalSettings(), ...settings } as UserSettings;
      }
    },
    onSuccess: (data) => {
      qc.setQueryData(userKeys.settings(user?.id), data);
    },
  });

  return { settings: query.data, isLoading: query.isLoading, updateSettings: mutation.mutate, isPending: mutation.isPending };
}

export function useWatchlist() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: userKeys.watchlist(user?.id),
    queryFn: () => user ? getWatchlist(user.id) : Promise.resolve({ items: [], total: 0 }),
    enabled: !!user,
    staleTime: 30 * 1000,
  });

  const addMutation = useMutation({
    mutationFn: (item: Omit<WatchlistItem, "addedAt">) => {
      if (!user) throw new Error("Not authenticated");
      return addToWatchlist(user.id, item);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.watchlist(user?.id) }),
  });

  const removeMutation = useMutation({
    mutationFn: (mediaId: string) => {
      if (!user) throw new Error("Not authenticated");
      return removeFromWatchlist(user.id, mediaId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.watchlist(user?.id) }),
  });

  const isInWatchlist = (mediaId: string) =>
    query.data?.items.some((i) => i.mediaId === mediaId) ?? false;

  return {
    watchlist: query.data,
    isLoading: query.isLoading,
    isInWatchlist,
    add: addMutation.mutate,
    remove: removeMutation.mutate,
    addPending: addMutation.isPending,
    removePending: removeMutation.isPending,
  };
}

export function useWatchHistory(limitCount = 20) {
  const { user } = useAuth();
  return useQuery({
    queryKey: userKeys.history(user?.id),
    queryFn: () => user ? getWatchHistory(user.id, limitCount) : Promise.resolve({ items: [], total: 0 }),
    enabled: !!user,
    staleTime: 30 * 1000,
  });
}

export function usePlaybackProgress(mediaId: string, mediaType: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: userKeys.progress(user?.id, mediaId),
    queryFn: () => user ? getProgress(user.id, mediaId) : Promise.resolve(null),
    enabled: !!user && !!mediaId,
    staleTime: 30 * 1000,
  });
}

export function useSaveProgress() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
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
    }) => {
      if (!user) return;
      await saveProgress(user.id, data.mediaId, data);
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: userKeys.progress(user?.id, vars.mediaId) });
      qc.invalidateQueries({ queryKey: userKeys.continueWatching(user?.id) });
    },
  });
}

export function useContinueWatching() {
  const { user } = useAuth();
  return useQuery({
    queryKey: userKeys.continueWatching(user?.id),
    queryFn: () => user ? getContinueWatching(user.id) : Promise.resolve([]),
    enabled: !!user,
    staleTime: 30 * 1000,
  });
}
