"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { MovieCard } from "@/components/media/MovieCard";
import type { MediaItem } from "@/types/media";

export function MediaRow({
  title,
  description,
  items,
}: {
  title: string;
  description?: string;
  items: MediaItem[];
}) {
  const rowRef = useRef<HTMLDivElement>(null);

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-semibold">{title}</h2>
          {description ? <p className="mt-2 text-sm text-[var(--muted)]">{description}</p> : null}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => rowRef.current?.scrollBy({ left: -720, behavior: "smooth" })}
            className="rounded-full border border-white/10 p-3 text-[var(--muted)] transition hover:text-white"
            aria-label={`Scroll ${title} left`}
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => rowRef.current?.scrollBy({ left: 720, behavior: "smooth" })}
            className="rounded-full border border-white/10 p-3 text-[var(--muted)] transition hover:text-white"
            aria-label={`Scroll ${title} right`}
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>

      <div ref={rowRef} className="scrollbar-hidden flex gap-4 overflow-x-auto pb-2">
        {items.map((item) => (
          <div key={`${item.mediaType}-${item.id}`} className="shrink-0 w-[160px] sm:w-[200px] md:w-[220px]">
            <MovieCard media={item} />
          </div>
        ))}
      </div>
    </section>
  );
}
