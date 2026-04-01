"use client";

import { useEffect, useEffectEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Play, Ticket } from "lucide-react";

import { TrailerModal } from "@/components/media/TrailerModal";
import { useSettingsContext } from "@/context/SettingsContext";
import { cn } from "@/lib/cn";
import type { MediaItem } from "@/types/media";

export function HeroCarousel({ items }: { items: MediaItem[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const { settings } = useSettingsContext();

  const activeItem = items[activeIndex] ?? items[0];
  const advance = useEffectEvent(() => {
    setActiveIndex((current) => (items.length === 0 ? 0 : (current + 1) % items.length));
  });

  useEffect(() => {
    if (!settings.enableAnimations || items.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => advance(), 8000);
    return () => window.clearInterval(timer);
  }, [advance, items.length, settings.enableAnimations]);

  if (!activeItem) {
    return null;
  }

  return (
    <>
      <section className="relative overflow-hidden border-b border-white/8">
        <div className="absolute inset-0">
          {items.slice(0, 5).map((item, index) => (
            <div
              key={item.id}
              className={cn(
                "absolute inset-0 transition-opacity duration-[1200ms]",
                index === activeIndex ? "opacity-100" : "opacity-0",
              )}
            >
              <Image
                src={
                  item.backdropPath
                    ? `https://image.tmdb.org/t/p/original${item.backdropPath}`
                    : item.posterPath
                      ? `https://image.tmdb.org/t/p/original${item.posterPath}`
                      : "/opengraph.jpg"
                }
                alt={item.title}
                fill
                priority={index === 0}
                sizes="100vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#05070b] via-[#05070be5] to-[#05070b30]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05070b] via-transparent to-[#05070b66]" />

        <div className="page-shell relative flex min-h-[72vh] items-end py-16">
          <div className="max-w-3xl">
            <p className="mb-4 text-xs uppercase tracking-[0.45em] text-[var(--muted)]">Trending Today</p>
            <h1 className="max-w-2xl text-5xl font-semibold leading-none sm:text-6xl md:text-7xl">
              {activeItem.title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--muted)] sm:text-lg">
              {activeItem.overview}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href={`/title/${activeItem.mediaType}/${activeItem.id}`}
                className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-black transition hover:brightness-110"
              >
                <span className="inline-flex items-center gap-2">
                  <Play className="size-4 fill-current" />
                  Open title
                </span>
              </Link>
              <button
                type="button"
                onClick={() => setTrailerOpen(true)}
                className="liquid-glass-soft rounded-full px-6 py-3 text-sm font-semibold text-white"
              >
                <span className="inline-flex items-center gap-2">
                  <Ticket className="size-4" />
                  Watch trailer
                </span>
              </button>
            </div>
          </div>

          <div className="absolute bottom-8 right-5 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveIndex((current) => (current === 0 ? items.length - 1 : current - 1))}
              className="rounded-full border border-white/10 bg-black/35 p-3 text-[var(--muted)] transition hover:text-white"
              aria-label="Previous hero slide"
            >
              <ChevronLeft className="size-5" />
            </button>
            <div className="flex items-center gap-2">
              {items.slice(0, 5).map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    "size-2.5 rounded-full transition",
                    index === activeIndex ? "bg-[var(--accent)]" : "bg-white/25",
                  )}
                  aria-label={`Go to hero slide ${index + 1}`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setActiveIndex((current) => (current + 1) % items.length)}
              className="rounded-full border border-white/10 bg-black/35 p-3 text-[var(--muted)] transition hover:text-white"
              aria-label="Next hero slide"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>
      </section>

      <TrailerModal
        open={trailerOpen}
        onClose={() => setTrailerOpen(false)}
        mediaType={activeItem.mediaType}
        mediaId={activeItem.id}
        title={activeItem.title}
      />
    </>
  );
}
