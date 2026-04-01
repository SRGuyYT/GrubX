import "server-only";

import type { Genre, MediaDetails, MediaPage, MediaType } from "@/types/media";
import { env } from "@/lib/env";
import {
  normalizeEpisodes,
  normalizeGenreList,
  normalizeMediaDetails,
  normalizeMediaPage,
  normalizeTrailer,
} from "@/lib/tmdb/normalizers";

const buildUrl = (path: string, params: Record<string, string | number | undefined>) => {
  const url = new URL(`${env.tmdbProxyBase.replace(/\/$/, "")}${path}`);
  url.searchParams.set("api_key", env.tmdbApiKey);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
};

const tmdbServerFetch = async <T>(
  path: string,
  params: Record<string, string | number | undefined> = {},
  revalidate = 300,
) => {
  const response = await fetch(buildUrl(path, params), {
    next: { revalidate },
  });

  if (!response.ok) {
    throw new Error(`TMDB request failed: ${response.status} ${path}`);
  }

  return (await response.json()) as T;
};

export const getTrendingHero = async (): Promise<MediaPage> => {
  const payload = await tmdbServerFetch<Record<string, unknown>>("/trending/all/day");
  return normalizeMediaPage(payload);
};

export const getServerMediaPage = async (options: {
  mediaType: MediaType;
  genre?: string | null;
  page?: number;
  query?: string;
  category?: "popular" | "top_rated";
  revalidate?: number;
}): Promise<MediaPage> => {
  const { mediaType, genre, page = 1, query, category = "popular", revalidate = 300 } = options;

  if (query && query.trim().length > 0) {
    const payload = await tmdbServerFetch<Record<string, unknown>>(
      `/search/${mediaType}`,
      { query, page },
      revalidate,
    );
    return normalizeMediaPage(payload, mediaType);
  }

  if (genre) {
    const payload = await tmdbServerFetch<Record<string, unknown>>(
      `/discover/${mediaType}`,
      { with_genres: genre, page, sort_by: "popularity.desc" },
      revalidate,
    );
    return normalizeMediaPage(payload, mediaType);
  }

  const payload = await tmdbServerFetch<Record<string, unknown>>(`/${mediaType}/${category}`, { page }, revalidate);
  return normalizeMediaPage(payload, mediaType);
};

export const getServerMediaDetails = async (
  mediaType: MediaType,
  id: string,
  revalidate = 300,
): Promise<MediaDetails> => {
  const payload = await tmdbServerFetch<Record<string, unknown>>(
    `/${mediaType}/${id}`,
    { append_to_response: "videos,credits" },
    revalidate,
  );
  return normalizeMediaDetails(payload, mediaType);
};

export const getServerSeasonEpisodes = async (id: string, season: number) => {
  const payload = await tmdbServerFetch<Record<string, unknown>>(`/tv/${id}/season/${season}`);
  return {
    seasonNumber: Number(payload.season_number ?? season),
    episodes: normalizeEpisodes(payload.episodes),
  };
};

export const getServerGenres = async (mediaType: MediaType): Promise<Genre[]> => {
  const payload = await tmdbServerFetch<{ genres?: unknown[] }>(`/genre/${mediaType}/list`);
  return normalizeGenreList(payload.genres);
};

export const getServerTrailer = async (mediaType: MediaType, id: string) => {
  const payload = await tmdbServerFetch<{ results?: unknown[] }>(`/${mediaType}/${id}/videos`);
  return normalizeTrailer(payload.results);
};
