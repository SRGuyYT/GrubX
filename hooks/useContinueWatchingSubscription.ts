"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useSettingsContext } from "@/context/SettingsContext";
import { queryKeys } from "@/lib/queryKeys";
import { dataLayer } from "@/lib/dataLayer";
import type { PlaybackProgress } from "@/types/data-layer";

export const useContinueWatchingSubscription = () => {
  const queryClient = useQueryClient();
  const { ready, mode, scope } = useSettingsContext();
  const queryKey = queryKeys.continueWatching(mode, scope.mode === "account" ? scope.uid : null);

  useEffect(() => {
    if (!ready) {
      return;
    }

    return dataLayer.subscribeContinueWatching(scope, (items) => {
      queryClient.setQueryData(queryKey, items);
    });
  }, [queryClient, queryKey, ready, scope]);

  return useQuery<PlaybackProgress[]>({
    queryKey,
    queryFn: async () => (queryClient.getQueryData<PlaybackProgress[]>(queryKey) ?? []),
    enabled: ready,
    initialData: [],
    staleTime: Number.POSITIVE_INFINITY,
  });
};
