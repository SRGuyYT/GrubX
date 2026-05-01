"use client";

import type { ReactNode } from "react";
import { BookmarkPlus, ThumbsDown } from "lucide-react";

import { cn } from "@/lib/cn";

export function RecommendationRail<T>({
  title,
  description,
  items,
  getKey,
  renderItem,
  onNotInterested,
  onSaveForLater,
  className,
}: {
  title: string;
  description?: string;
  items: T[];
  getKey: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  onNotInterested?: (item: T) => void;
  onSaveForLater?: (item: T) => void;
  className?: string;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className={cn("space-y-4", className)}>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          {description ? <p className="mt-1 text-sm text-[var(--muted)]">{description}</p> : null}
        </div>
      </div>

      <div className="-mx-4 overflow-x-auto px-4 pb-2 scrollbar-hidden">
        <div className="flex gap-[var(--card-gap)]">
          {items.map((item) => (
            <div key={getKey(item)} className="w-[min(62vw,220px)] shrink-0 sm:w-[220px] md:w-[238px]">
              {renderItem(item)}
              {onNotInterested || onSaveForLater ? (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {onNotInterested ? (
                    <button
                      type="button"
                      onClick={() => onNotInterested(item)}
                      className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-white/10 bg-white/[0.045] px-3 text-xs font-semibold text-[var(--muted)] transition hover:border-white/20 hover:text-white active:scale-[0.98]"
                    >
                      <ThumbsDown className="size-3.5" />
                      Not for me
                    </button>
                  ) : null}
                  {onSaveForLater ? (
                    <button
                      type="button"
                      onClick={() => onSaveForLater(item)}
                      className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-white/10 bg-white/[0.045] px-3 text-xs font-semibold text-[var(--muted)] transition hover:border-white/20 hover:text-white active:scale-[0.98]"
                    >
                      <BookmarkPlus className="size-3.5" />
                      Later
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
