"use client";

import { EmptyState } from "@/components/feedback/EmptyState";
import { MediaRow } from "@/components/media/MediaRow";
import { useWatchlistSubscription } from "@/hooks/useWatchlistSubscription";
import type { MediaItem } from "@/types/media";

export function WatchlistRow() {
  const query = useWatchlistSubscription();
  const items = (query.data ?? []).map(
    (item) =>
      ({
        id: item.mediaId,
        tmdbId: Number(item.mediaId),
        title: item.title,
        mediaType: item.mediaType,
        overview: "Saved to your active mode watchlist.",
        posterPath: item.posterPath,
        backdropPath: item.backdropPath,
        releaseDate: item.addedAt,
        rating: item.rating,
        voteCount: null,
      }) satisfies MediaItem,
  );

  if (items.length === 0) {
    return (
      <EmptyState
        title="Watchlist is empty"
        description="Use the card actions or title pages to add movies and shows to your active mode."
      />
    );
  }

  return <MediaRow title="Watchlist" description="Realtime from your active storage mode." items={items} />;
}
