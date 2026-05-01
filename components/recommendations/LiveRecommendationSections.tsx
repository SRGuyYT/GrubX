"use client";

import Image from "next/image";
import { CalendarDays, Radio } from "lucide-react";

import { RecommendationRail } from "@/components/recommendations/RecommendationRail";
import type { RecommendationResults } from "@/hooks/useRecommendations";
import { cn } from "@/lib/cn";
import { formatLiveStart, resolveLivePosterUrl } from "@/lib/live/client";
import type { LiveMatch } from "@/types/live";

function LiveRecommendationCard({
  match,
  onOpen,
}: {
  match: LiveMatch;
  onOpen: (match: LiveMatch) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(match)}
      className={cn(
        "group block h-full w-full overflow-hidden rounded-[1.2rem] border border-white/8 bg-white/[0.035] p-2.5 text-left transition",
        "hover:-translate-y-1 hover:border-white/16 active:scale-[0.985]",
      )}
    >
      <div className="relative aspect-video overflow-hidden rounded-[0.92rem] border border-white/8 bg-black">
        <Image
          src={resolveLivePosterUrl(match)}
          alt={match.title}
          fill
          sizes="240px"
          className="object-cover transition duration-500 group-hover:scale-[1.045]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/82 via-black/12 to-transparent" />
        <span className="absolute right-3 top-3 rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
          {match.score?.state === "post" ? "Final" : match.score?.state === "in" ? "Live" : "Sports"}
        </span>
        <div className="absolute inset-x-0 bottom-0 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">{match.category}</p>
          <h3 className="mt-1 line-clamp-2 text-base font-semibold text-white">{match.title}</h3>
        </div>
      </div>

      <div className="space-y-2 px-0.5 pt-3 text-sm text-[var(--muted)]">
        <span className="inline-flex items-center gap-2">
          <CalendarDays className="size-4" />
          {formatLiveStart(match.date)}
        </span>
        <span className="flex items-center gap-2">
          <Radio className="size-4 text-[var(--accent)]" />
          {match.sources.length} source{match.sources.length === 1 ? "" : "s"}
        </span>
      </div>
    </button>
  );
}

export function LiveRecommendationSections({
  recommendations,
  onOpenMatch,
}: {
  recommendations: RecommendationResults<LiveMatch>;
  onOpenMatch: (match: LiveMatch) => void;
}) {
  return (
    <div className="space-y-8">
      <RecommendationRail
        title="Recommended for You"
        description="Based on your sports filters, opened events, and search habits."
        items={recommendations.recommendedItems}
        getKey={(item) => `recommended-live-${item.id}`}
        renderItem={(item) => <LiveRecommendationCard match={item} onOpen={onOpenMatch} />}
        onNotInterested={recommendations.markNotInterested}
        onSaveForLater={recommendations.saveForLater}
      />

      <RecommendationRail
        title={recommendations.latestViewedItem ? `Because You Watched ${recommendations.latestViewedItem.title}` : "Because You Watched"}
        items={recommendations.becauseYouWatchedItems}
        getKey={(item) => `because-live-${item.id}`}
        renderItem={(item) => <LiveRecommendationCard match={item} onOpen={onOpenMatch} />}
        onNotInterested={recommendations.markNotInterested}
        onSaveForLater={recommendations.saveForLater}
      />

      <RecommendationRail
        title="Trending in Your Genres"
        description="Events from the sports you keep choosing."
        items={recommendations.trendingInYourGenresItems}
        getKey={(item) => `genres-live-${item.id}`}
        renderItem={(item) => <LiveRecommendationCard match={item} onOpen={onOpenMatch} />}
        onNotInterested={recommendations.markNotInterested}
        onSaveForLater={recommendations.saveForLater}
      />
    </div>
  );
}
