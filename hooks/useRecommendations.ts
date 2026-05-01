"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { FilterState } from "@/hooks/useFilters";
import {
  getLatestViewedItem,
  getRecommendationState,
  getSimilarityScore,
  getTopGenres,
  rankRecommendations,
  RECOMMENDATION_EVENT,
  trackNotInterested,
  trackSavedForLater,
  type RecommendationItem,
  type RecommendationState,
} from "@/lib/recommendationEngine";

export type RecommendationResults<T> = {
  recommendedItems: T[];
  becauseYouWatchedItems: T[];
  trendingInYourGenresItems: T[];
  latestViewedItem: RecommendationItem | null;
  state: RecommendationState;
  markNotInterested: (item: T) => void;
  saveForLater: (item: T) => void;
};

export function useRecommendations<T>({
  content,
  filters,
  toRecommendationItem,
  mediaType,
  limit = 12,
  enabled = true,
}: {
  content: T[];
  filters: FilterState;
  toRecommendationItem: (item: T) => RecommendationItem;
  mediaType?: string;
  limit?: number;
  enabled?: boolean;
}): RecommendationResults<T> {
  const [state, setState] = useState<RecommendationState>(() => getRecommendationState());

  useEffect(() => {
    const refresh = () => setState(getRecommendationState());

    window.addEventListener(RECOMMENDATION_EVENT, refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener(RECOMMENDATION_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const rankedItems = useMemo(
    () => (enabled ? rankRecommendations(content, filters, state, toRecommendationItem) : []),
    [content, enabled, filters, state, toRecommendationItem],
  );

  const latestViewedItem = useMemo(() => getLatestViewedItem(state, mediaType), [mediaType, state]);

  const becauseYouWatchedItems = useMemo(() => {
    if (!enabled || !latestViewedItem) {
      return [];
    }

    return content
      .map((item) => {
        const recommendation = toRecommendationItem(item);
        return {
          item,
          score: getSimilarityScore(recommendation, latestViewedItem),
          recommendation,
        };
      })
      .filter(
        (entry) =>
          entry.score > 0 &&
          !(entry.recommendation.id === latestViewedItem.id && entry.recommendation.mediaType === latestViewedItem.mediaType),
      )
      .sort((left, right) => right.score - left.score)
      .slice(0, limit)
      .map((entry) => entry.item);
  }, [content, enabled, latestViewedItem, limit, toRecommendationItem]);

  const trendingInYourGenresItems = useMemo(() => {
    if (!enabled) {
      return [];
    }

    const topGenres = getTopGenres(state, filters);
    if (!topGenres.length) {
      return [];
    }

    return content
      .map((item) => {
        const recommendation = toRecommendationItem(item);
        const score = topGenres.reduce(
          (count, genre) =>
            count + (recommendation.genres.some((itemGenre) => itemGenre.toLowerCase() === genre.toLowerCase()) ? 1 : 0),
          0,
        );
        return { item, score };
      })
      .filter((entry) => entry.score > 0)
      .sort((left, right) => right.score - left.score)
      .slice(0, limit)
      .map((entry) => entry.item);
  }, [content, enabled, filters, limit, state, toRecommendationItem]);

  const markNotInterested = useCallback(
    (item: T) => {
      trackNotInterested(toRecommendationItem(item));
    },
    [toRecommendationItem],
  );

  const saveForLater = useCallback(
    (item: T) => {
      trackSavedForLater(toRecommendationItem(item));
    },
    [toRecommendationItem],
  );

  return {
    recommendedItems: rankedItems.slice(0, limit).map((entry) => entry.item),
    becauseYouWatchedItems,
    trendingInYourGenresItems,
    latestViewedItem,
    state,
    markNotInterested,
    saveForLater,
  };
}
