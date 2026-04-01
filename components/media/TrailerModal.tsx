"use client";

import { useEffect } from "react";
import { ExternalLink, X } from "lucide-react";

import { LoadingState } from "@/components/feedback/LoadingState";
import { EmptyState } from "@/components/feedback/EmptyState";
import { useSettingsContext } from "@/context/SettingsContext";
import { useTrailer } from "@/hooks/useTrailer";
import type { MediaType } from "@/types/media";

export function TrailerModal({
  open,
  onClose,
  mediaType,
  mediaId,
  title,
}: {
  open: boolean;
  onClose: () => void;
  mediaType: MediaType;
  mediaId: string;
  title: string;
}) {
  const { settings } = useSettingsContext();
  const trailerQuery = useTrailer(mediaType, mediaId, open);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onEscape);
    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", onEscape);
    };
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  const trailer = trailerQuery.data;
  const autoplay = settings.autoplayTrailers ? "1" : "0";
  const embedUrl = trailer ? `${trailer.embedUrl}?autoplay=${autoplay}&rel=0` : null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-md">
      <button type="button" aria-label="Close trailer modal" className="absolute inset-0" onClick={onClose} />
      <div className="liquid-glass relative z-[81] w-full max-w-5xl rounded-[2rem] p-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Trailer</p>
            <h2 className="text-2xl font-semibold">{title}</h2>
          </div>

          <div className="flex items-center gap-2">
            {trailer ? (
              <a
                href={`https://www.youtube.com/watch?v=${trailer.key}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-[var(--muted)] transition hover:text-white"
              >
                <span className="inline-flex items-center gap-2">
                  Open YouTube
                  <ExternalLink className="size-4" />
                </span>
              </a>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/10 p-3 text-[var(--muted)] transition hover:text-white"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {trailerQuery.isPending ? (
          <LoadingState title="Loading trailer" description="Fetching the first YouTube trailer for this title." />
        ) : trailerQuery.isError ? (
          <EmptyState title="Trailer unavailable" description="TMDB did not return a playable YouTube trailer." />
        ) : trailer && embedUrl ? (
          <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-black">
            <div className="aspect-video">
              <iframe
                src={embedUrl}
                title={`${title} trailer`}
                className="h-full w-full border-0"
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              />
            </div>
          </div>
        ) : (
          <EmptyState title="No trailer found" description="Only click-open YouTube trailers are allowed here." />
        )}
      </div>
    </div>
  );
}
