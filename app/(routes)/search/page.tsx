"use client";

import { useState } from "react";

import { CatalogGrid } from "@/components/media/CatalogGrid";
import type { MediaType } from "@/types/media";

export default function SearchPage() {
  const [mediaType, setMediaType] = useState<MediaType>("movie");

  return (
    <div className="page-shell py-10">
      <div className="mb-5 flex gap-3">
        {(["movie", "tv"] as MediaType[]).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setMediaType(type)}
            className={`rounded-full border px-4 py-2 text-sm transition ${
              mediaType === type
                ? "border-[var(--accent)] bg-[var(--accent-soft)] text-white"
                : "border-white/10 bg-white/5 text-[var(--muted)] hover:text-white"
            }`}
          >
            {type === "movie" ? "Movies" : "TV"}
          </button>
        ))}
      </div>

      <CatalogGrid
        key={mediaType}
        mediaType={mediaType}
        title={mediaType === "movie" ? "Search Movies" : "Search TV"}
        description="Client-side search with deduped results and the same scroll engine used by the catalog routes."
        allowSearch
      />
    </div>
  );
}
