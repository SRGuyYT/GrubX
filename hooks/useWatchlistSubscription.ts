"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useSettingsContext } from "@/context/SettingsContext";
import { queryKeys } from "@/lib/queryKeys";
import { dataLayer } from "@/lib/dataLayer";
import type { WatchlistItem } from "@/types/data-layer";

export const useWatchlistSubscription = () => {
  const queryClient = useQueryClient();
  const { ready, mode, scope } = useSettingsContext();
  const queryKey = queryKeys.watchlist(mode, scope.mode === "account" ? scope.uid : null);

  useEffect(() => {
    if (!ready) {
      return;
    }

    return dataLayer.subscribeWatchlist(scope, (items) => {
      queryClient.setQueryData(queryKey, items);
    });
  }, [queryClient, queryKey, ready, scope]);

  return useQuery<WatchlistItem[]>({
    queryKey,
    queryFn: async () => (queryClient.getQueryData<WatchlistItem[]>(queryKey) ?? []),
    enabled: ready,
    initialData: [],
    staleTime: Number.POSITIVE_INFINITY,
  });
};
