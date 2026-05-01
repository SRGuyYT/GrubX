import "server-only";

import type { Genre, MediaDetails, MediaPage, MediaType } from "@/types/media";
import {
  normalizeEpisodes,
  normalizeGenreList,
  normalizeMediaDetails,
  normalizeMediaPage,
  normalizeTrailer,
} from "@/lib/tmdb/normalizers";
import { fetchTmdbJson } from "@/lib/tmdb/request";

export const getTrendingHero = async (): Promise<MediaPage> => {
  const { payload } = await fetchTmdbJson<Record<string, unknown>>("/trending/all/day");
  return normalizeMediaPage(payload);
};

export const getServerMediaPage = async (options: {
  mediaType: MediaType;
  genre?: string | null;
  genres?: string[];
  ratings?: string[];
  yearFrom?: number;
  yearTo?: number;
  page?: number;
  query?: string;
  category?: "popular" | "top_rated";
  revalidate?: number;
}): Promise<MediaPage> => {
  const { mediaType, genre, genres = [], ratings = [], yearFrom, yearTo, page = 1, query, category = "popular", revalidate = 300 } = options;
  const selectedGenres = genres.length > 0 ? genres : genre ? [genre] : [];
  const selectedRatings = ratings.filter(Boolean);

  if (query && query.trim().length > 0) {
    const { payload } = await fetchTmdbJson<Record<string, unknown>>(
      `/search/${mediaType}`,
      { query, page },
      revalidate,
    );
    return normalizeMediaPage(payload, mediaType);
  }

  if (selectedGenres.length > 0 || selectedRatings.length > 0 || yearFrom || yearTo) {
    const datePrefix = mediaType === "movie" ? "primary_release_date" : "first_air_date";
    const ratingParams =
      mediaType === "movie"
        ? {
            certification_country: selectedRatings.length > 0 ? "US" : undefined,
            certification: selectedRatings.length > 0 ? selectedRatings.join("|") : undefined,
          }
        : {
            with_content_rating: selectedRatings.length > 0 ? selectedRatings.join("|") : undefined,
          };
    const { payload } = await fetchTmdbJson<Record<string, unknown>>(
      `/discover/${mediaType}`,
      {
        with_genres: selectedGenres.length > 0 ? selectedGenres.join(",") : undefined,
        page,
        sort_by: "popularity.desc",
        [`${datePrefix}.gte`]: yearFrom ? `${yearFrom}-01-01` : undefined,
        [`${datePrefix}.lte`]: yearTo ? `${yearTo}-12-31` : undefined,
        ...ratingParams,
      },
      revalidate,
    );
    return normalizeMediaPage(payload, mediaType);
  }

  const { payload } = await fetchTmdbJson<Record<string, unknown>>(`/${mediaType}/${category}`, { page }, revalidate);
  return normalizeMediaPage(payload, mediaType);
};

export const getServerMediaDetails = async (
  mediaType: MediaType,
  id: string,
  revalidate = 300,
): Promise<MediaDetails> => {
  const { payload } = await fetchTmdbJson<Record<string, unknown>>(
    `/${mediaType}/${id}`,
    { append_to_response: "videos,credits" },
    revalidate,
  );
  return normalizeMediaDetails(payload, mediaType);
};

export const getServerSeasonEpisodes = async (id: string, season: number) => {
  const { payload } = await fetchTmdbJson<Record<string, unknown>>(`/tv/${id}/season/${season}`);
  return {
    seasonNumber: Number(payload.season_number ?? season),
    episodes: normalizeEpisodes(payload.episodes),
  };
};

export const getServerGenres = async (mediaType: MediaType): Promise<Genre[]> => {
  const { payload } = await fetchTmdbJson<{ genres?: unknown[] }>(`/genre/${mediaType}/list`);
  return normalizeGenreList(payload.genres);
};

export const getServerTrailer = async (mediaType: MediaType, id: string) => {
  const { payload } = await fetchTmdbJson<{ results?: unknown[] }>(`/${mediaType}/${id}/videos`);
  return normalizeTrailer(payload.results);
};
