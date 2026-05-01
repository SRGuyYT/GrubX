"use client";

import { MovieCard } from "@/components/media/MovieCard";
import { RecommendationRail } from "@/components/recommendations/RecommendationRail";
import type { RecommendationResults } from "@/hooks/useRecommendations";
import type { MediaItem } from "@/types/media";

export function MediaRecommendationSections({
  recommendations,
}: {
  recommendations: RecommendationResults<MediaItem>;
}) {
  return (
    <div className="space-y-8">
      <RecommendationRail
        title="Recommended for You"
        description="Shaped by your filters, searches, and what you open."
        items={recommendations.recommendedItems}
        getKey={(item) => `recommended-${item.mediaType}-${item.id}`}
        renderItem={(item) => <MovieCard media={item} />}
        onNotInterested={recommendations.markNotInterested}
        onSaveForLater={recommendations.saveForLater}
      />

      <RecommendationRail
        title={recommendations.latestViewedItem ? `Because You Watched ${recommendations.latestViewedItem.title}` : "Because You Watched"}
        items={recommendations.becauseYouWatchedItems}
        getKey={(item) => `because-${item.mediaType}-${item.id}`}
        renderItem={(item) => <MovieCard media={item} />}
        onNotInterested={recommendations.markNotInterested}
        onSaveForLater={recommendations.saveForLater}
      />

      <RecommendationRail
        title="Trending in Your Genres"
        description="More titles in the lanes you keep coming back to."
        items={recommendations.trendingInYourGenresItems}
        getKey={(item) => `genres-${item.mediaType}-${item.id}`}
        renderItem={(item) => <MovieCard media={item} />}
        onNotInterested={recommendations.markNotInterested}
        onSaveForLater={recommendations.saveForLater}
      />
    </div>
  );
}
