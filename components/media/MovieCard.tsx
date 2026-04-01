"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Star, Ticket } from "lucide-react";

import { PlaybackTheater } from "@/components/media/PlaybackTheater";
import { TrailerModal } from "@/components/media/TrailerModal";
import { useSettingsContext } from "@/context/SettingsContext";
import type { MediaItem, SeasonSummary } from "@/types/media";

export function MovieCard({
  media,
  seasons,
}: {
  media: MediaItem;
  seasons?: SeasonSummary[];
}) {
  const [playerOpen, setPlayerOpen] = useState(false);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const { settings } = useSettingsContext();
  const imageWidth = settings.dataSaver ? "w342" : "w500";

  return (
    <>
      <article className="group relative min-w-[220px] max-w-[220px]">
        <div className="liquid-glass-soft overflow-hidden rounded-[1.6rem]">
          <Link href={`/title/${media.mediaType}/${media.id}`} className="relative block aspect-[2/3] overflow-hidden">
            <Image
              src={
                media.posterPath
                  ? `https://image.tmdb.org/t/p/${imageWidth}${media.posterPath}`
                  : "/512x512.png"
              }
              alt={media.title}
              fill
              sizes="220px"
              loading="lazy"
              className="object-cover transition duration-500 group-hover:scale-[1.05]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90" />
            <div className="absolute inset-x-0 bottom-0 p-4">
              <div className="mb-3 flex items-center gap-2 text-xs text-[var(--muted)]">
                {media.rating ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/35 px-2 py-1">
                    <Star className="size-3 fill-[var(--accent)] text-[var(--accent)]" />
                    {media.rating.toFixed(1)}
                  </span>
                ) : null}
                {media.releaseDate ? (
                  <span className="rounded-full border border-white/10 bg-black/35 px-2 py-1">
                    {new Date(media.releaseDate).getFullYear()}
                  </span>
                ) : null}
              </div>
              <h3 className="line-clamp-2 text-lg font-semibold text-white">{media.title}</h3>
              <p className="mt-2 line-clamp-3 text-sm text-[var(--muted)]">{media.overview || "No overview available."}</p>
            </div>
          </Link>

          <div className="flex items-center gap-2 p-3">
            <button
              type="button"
              onClick={() => setPlayerOpen(true)}
              className="flex-1 rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-black transition hover:brightness-110"
            >
              <span className="inline-flex items-center gap-2">
                <Play className="size-4 fill-current" />
                Quick Play
              </span>
            </button>
            <button
              type="button"
              onClick={() => setTrailerOpen(true)}
              className="rounded-full border border-white/10 px-4 py-2 text-sm text-[var(--muted)] transition hover:text-white"
            >
              <span className="inline-flex items-center gap-2">
                <Ticket className="size-4" />
                Trailer
              </span>
            </button>
          </div>
        </div>
      </article>

      <TrailerModal
        open={trailerOpen}
        onClose={() => setTrailerOpen(false)}
        mediaType={media.mediaType}
        mediaId={media.id}
        title={media.title}
      />
      <PlaybackTheater
        open={playerOpen}
        onClose={() => setPlayerOpen(false)}
        mediaType={media.mediaType}
        mediaId={media.id}
        title={media.title}
        posterPath={media.posterPath}
        backdropPath={media.backdropPath}
        seasons={seasons}
      />
    </>
  );
}
