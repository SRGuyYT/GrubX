const DEFAULT_TMDB_PROXY_BASE = "https://mtd.sky0cloud.dpdns.org";
const DEFAULT_TMDB_API_KEY = "bda755b29c8939787eded30edf76bec5";

const PROXY_BASE = (import.meta.env.VITE_TMDB_PROXY_BASE ?? DEFAULT_TMDB_PROXY_BASE).replace(/\/$/, "");
const API_KEY = import.meta.env.VITE_TMDB_API_KEY ?? DEFAULT_TMDB_API_KEY;

export async function tmdbFetch(path: string, params: Record<string, string> = {}) {
  const url = new URL(`${PROXY_BASE}${path}`);
  if (API_KEY) url.searchParams.set("api_key", API_KEY);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`TMDB ${res.status}: ${path}`);
  return res.json();
}

function buildMediaItem(item: Record<string, unknown>, mediaType?: string) {
  const type = (item.media_type as string) ?? mediaType ?? "movie";
  const title = ((item.title ?? item.name) as string) ?? "";
  const releaseDate = ((item.release_date ?? item.first_air_date) as string) ?? "";

  return {
    id: String(item.id),
    title,
    mediaType: type,
    posterPath: (item.poster_path as string) ?? null,
    backdropPath: (item.backdrop_path as string) ?? null,
    overview: (item.overview as string) ?? "",
    releaseDate,
    rating: (item.vote_average as number) ?? 0,
    voteCount: (item.vote_count as number) ?? 0,
  };
}

export async function fetchTrending(type = "all", timeWindow = "week") {
  const data = await tmdbFetch(`/trending/${type}/${timeWindow}`);
  return {
    results: (data.results as Record<string, unknown>[]).map((r) => buildMediaItem(r)),
    page: data.page,
    totalPages: data.total_pages,
  };
}

export async function fetchPopular(type: "movie" | "tv") {
  const data = await tmdbFetch(`/${type}/popular`);
  return {
    results: (data.results as Record<string, unknown>[]).map((r) => buildMediaItem(r, type)),
    page: data.page,
    totalPages: data.total_pages,
  };
}

export async function fetchTopRated(type: "movie" | "tv") {
  const data = await tmdbFetch(`/${type}/top_rated`);
  return {
    results: (data.results as Record<string, unknown>[]).map((r) => buildMediaItem(r, type)),
    page: data.page,
    totalPages: data.total_pages,
  };
}

export async function searchMedia(query: string, type = "all", page = "1") {
  let data;
  if (type === "movie") {
    data = await tmdbFetch("/search/movie", { query, page });
    return { results: (data.results as Record<string, unknown>[]).map((r) => buildMediaItem(r, "movie")), totalResults: data.total_results, page: data.page, totalPages: data.total_pages };
  } else if (type === "tv") {
    data = await tmdbFetch("/search/tv", { query, page });
    return { results: (data.results as Record<string, unknown>[]).map((r) => buildMediaItem(r, "tv")), totalResults: data.total_results, page: data.page, totalPages: data.total_pages };
  } else {
    data = await tmdbFetch("/search/multi", { query, page });
    return {
      results: (data.results as Record<string, unknown>[])
        .filter((r) => r.media_type === "movie" || r.media_type === "tv")
        .map((r) => buildMediaItem(r)),
      totalResults: data.total_results,
      page: data.page,
      totalPages: data.total_pages,
    };
  }
}

export async function fetchMediaDetails(mediaType: "movie" | "tv", id: string) {
  const data = await tmdbFetch(`/${mediaType}/${id}`, { append_to_response: "videos,credits" });
  const base = buildMediaItem(data, mediaType);
  const videos = data.videos as { results?: { site: string; type: string; key: string }[] } | undefined;
  const trailerVideo = videos?.results?.find((v) => v.site === "YouTube" && v.type === "Trailer");
  const credits = data.credits as { cast?: { name: string; character: string; profile_path: string }[] } | undefined;
  const cast = (credits?.cast ?? []).slice(0, 12).map((c) => ({
    name: c.name,
    character: c.character,
    profilePath: (c.profile_path as string) ?? null,
  }));
  const seasons =
    mediaType === "tv"
      ? (
          (data.seasons ?? []) as {
            season_number: number;
            name: string;
            episode_count: number;
            poster_path: string;
          }[]
        )
          .filter((s) => s.season_number > 0)
          .map((s) => ({
            seasonNumber: s.season_number,
            name: s.name,
            episodeCount: s.episode_count,
            posterPath: s.poster_path ?? null,
          }))
      : [];

  return {
    ...base,
    runtime: (data.runtime as number) ?? null,
    cast,
    trailerKey: trailerVideo?.key ?? null,
    seasons,
    totalSeasons: (data.number_of_seasons as number) ?? null,
    status: (data.status as string) ?? null,
    tagline: (data.tagline as string) ?? null,
    genres: ((data.genres ?? []) as { name: string }[]).map((g) => g.name),
  };
}

export async function fetchSeasonEpisodes(id: string, season: number) {
  const data = await tmdbFetch(`/tv/${id}/season/${season}`);
  return {
    seasonNumber: data.season_number as number,
    episodes: ((data.episodes ?? []) as Record<string, unknown>[]).map((ep) => ({
      episodeNumber: ep.episode_number as number,
      name: (ep.name as string) ?? "",
      overview: (ep.overview as string) ?? "",
      stillPath: (ep.still_path as string) ?? null,
      runtime: (ep.runtime as number) ?? null,
      airDate: (ep.air_date as string) ?? null,
    })),
  };
}
