import Image from "next/image";
import { CalendarDays, Clock3, Layers3, Star } from "lucide-react";
import { notFound } from "next/navigation";

import { TitleActions } from "@/components/media/TitleActions";
import { getServerMediaDetails } from "@/lib/tmdb/server";
import type { MediaType } from "@/types/media";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ mediaType: string; id: string }>;
}) {
  const { mediaType, id } = await params;
  if (mediaType !== "movie" && mediaType !== "tv") {
    return { title: "GrubX" };
  }

  try {
    const media = await getServerMediaDetails(mediaType, id);
    return {
      title: `${media.title} | GrubX`,
      description: media.overview,
    };
  } catch {
    return { title: "GrubX" };
  }
}

export default async function TitlePage({
  params,
}: {
  params: Promise<{ mediaType: string; id: string }>;
}) {
  const { mediaType, id } = await params;
  if (mediaType !== "movie" && mediaType !== "tv") {
    notFound();
  }

  let media;
  try {
    media = await getServerMediaDetails(mediaType as MediaType, id);
  } catch {
    notFound();
  }

  return (
    <div className="pb-12">
      <section className="relative overflow-hidden border-b border-white/8">
        <div className="absolute inset-0">
          <Image
            src={
              media.backdropPath
                ? `https://image.tmdb.org/t/p/original${media.backdropPath}`
                : media.posterPath
                  ? `https://image.tmdb.org/t/p/original${media.posterPath}`
                  : "/opengraph.jpg"
            }
            alt={media.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#05070b] via-[#05070bd9] to-[#05070b1a]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05070b] via-transparent to-[#05070b88]" />

        <div className="page-shell relative flex min-h-[72vh] items-end py-14">
          <div className="grid gap-8 lg:grid-cols-[280px,1fr] lg:items-end">
            <div className="liquid-glass-soft hidden overflow-hidden rounded-[2rem] border border-white/10 lg:block">
              <div className="relative aspect-[2/3]">
                <Image
                  src={media.posterPath ? `https://image.tmdb.org/t/p/w500${media.posterPath}` : "/512x512.png"}
                  alt={media.title}
                  fill
                  sizes="280px"
                  className="object-cover"
                />
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-[var(--muted)]">{media.mediaType}</p>
              <h1 className="mt-3 text-5xl font-semibold sm:text-6xl">{media.title}</h1>
              {media.tagline ? <p className="mt-4 text-xl text-white/80">{media.tagline}</p> : null}
              <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-[var(--muted)]">
                {media.rating ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-2">
                    <Star className="size-4 fill-[var(--accent)] text-[var(--accent)]" />
                    {media.rating.toFixed(1)}
                  </span>
                ) : null}
                {media.releaseDate ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-2">
                    <CalendarDays className="size-4" />
                    {new Date(media.releaseDate).getFullYear()}
                  </span>
                ) : null}
                {media.runtime ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-2">
                    <Clock3 className="size-4" />
                    {media.runtime} min
                  </span>
                ) : null}
                {media.totalSeasons ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-2">
                    <Layers3 className="size-4" />
                    {media.totalSeasons} seasons
                  </span>
                ) : null}
              </div>

              <p className="mt-6 max-w-3xl text-base leading-8 text-[var(--muted)]">{media.overview}</p>

              <div className="mt-7">
                <TitleActions media={media} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell grid gap-8 py-10 lg:grid-cols-[1.2fr,0.8fr]">
        <div className="liquid-glass rounded-[2rem] px-6 py-6">
          <h2 className="text-2xl font-semibold">Cast</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {media.cast.map((person) => (
              <div key={`${person.name}-${person.character}`} className="liquid-glass-soft rounded-[1.5rem] px-4 py-4">
                <p className="text-base font-semibold">{person.name}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">{person.character}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="liquid-glass rounded-[2rem] px-6 py-6">
            <h2 className="text-2xl font-semibold">Genres</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {media.genres.map((genre) => (
                <span key={genre.id} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-[var(--muted)]">
                  {genre.name}
                </span>
              ))}
            </div>
          </div>

          {media.seasons.length > 0 ? (
            <div className="liquid-glass rounded-[2rem] px-6 py-6">
              <h2 className="text-2xl font-semibold">Seasons</h2>
              <div className="mt-5 space-y-3">
                {media.seasons.map((season) => (
                  <div key={season.seasonNumber} className="liquid-glass-soft rounded-[1.5rem] px-4 py-4">
                    <p className="text-base font-semibold">{season.name}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">{season.episodeCount} episodes</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
