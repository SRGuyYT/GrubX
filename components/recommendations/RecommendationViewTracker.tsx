"use client";

import { useEffect } from "react";

import { trackViewedItem, type RecommendationItem } from "@/lib/recommendationEngine";

export function RecommendationViewTracker({ item }: { item: RecommendationItem }) {
  useEffect(() => {
    trackViewedItem(item);
  }, [item]);

  return null;
}
