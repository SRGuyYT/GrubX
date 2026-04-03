"use client";

import { cn } from "@/lib/cn";
import type { Genre } from "@/types/media";

export function GenreFilter({
  genres,
  selectedGenre,
  onChange,
}: {
  genres: Genre[];
  selectedGenre: string | null;
  onChange: (genre: string | null) => void;
}) {
  return (
    <div className="scrollbar-hidden flex gap-3 overflow-x-auto pb-3 pt-1">
      <button
        type="button"
        onClick={() => onChange(null)}
        className={cn(
          "rounded-full border px-4 py-2.5 text-sm transition",
          selectedGenre === null
            ? "border-[var(--accent)] bg-[var(--accent-soft)] text-white"
            : "border-white/10 bg-white/5 text-[var(--muted)] hover:border-white/20 hover:text-white",
        )}
      >
        All Genres
      </button>
      {genres.map((genre) => (
        <button
          key={genre.id}
          type="button"
          onClick={() => onChange(String(genre.id))}
          className={cn(
            "rounded-full border px-4 py-2.5 text-sm transition",
            selectedGenre === String(genre.id)
              ? "border-[var(--accent)] bg-[var(--accent-soft)] text-white"
              : "border-white/10 bg-white/5 text-[var(--muted)] hover:border-white/20 hover:text-white",
          )}
        >
          {genre.name}
        </button>
      ))}
    </div>
  );
}
