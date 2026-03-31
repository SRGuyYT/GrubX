import { useQuery } from "@tanstack/react-query";
import {
  fetchTrending,
  fetchPopular,
  fetchTopRated,
  searchMedia,
  fetchMediaDetails,
  fetchSeasonEpisodes,
} from "@/lib/tmdb";

export const tmdbKeys = {
  trending: (type = "all", timeWindow = "week") => ["tmdb", "trending", type, timeWindow] as const,
  popular: (type: string) => ["tmdb", "popular", type] as const,
  topRated: (type: string) => ["tmdb", "topRated", type] as const,
  search: (q: string, type: string, page: string) => ["tmdb", "search", q, type, page] as const,
  details: (mediaType: string, id: string) => ["tmdb", "details", mediaType, id] as const,
  episodes: (id: string, season: number) => ["tmdb", "episodes", id, season] as const,
};

export function useTrendingMedia(type = "all", timeWindow = "week") {
  return useQuery({
    queryKey: tmdbKeys.trending(type, timeWindow),
    queryFn: () => fetchTrending(type, timeWindow),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePopularMedia(type: "movie" | "tv") {
  return useQuery({
    queryKey: tmdbKeys.popular(type),
    queryFn: () => fetchPopular(type),
    staleTime: 5 * 60 * 1000,
  });
}

export function useTopRatedMedia(type: "movie" | "tv") {
  return useQuery({
    queryKey: tmdbKeys.topRated(type),
    queryFn: () => fetchTopRated(type),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSearchMedia(q: string, type = "all", page = "1") {
  return useQuery({
    queryKey: tmdbKeys.search(q, type, page),
    queryFn: () => searchMedia(q, type, page),
    enabled: q.trim().length > 0,
    staleTime: 2 * 60 * 1000,
  });
}

export function useMediaDetails(mediaType: "movie" | "tv", id: string) {
  return useQuery({
    queryKey: tmdbKeys.details(mediaType, id),
    queryFn: () => fetchMediaDetails(mediaType, id),
    enabled: !!id && !!mediaType,
    staleTime: 10 * 60 * 1000,
  });
}

export function useSeasonEpisodes(id: string, season: number, enabled = true) {
  return useQuery({
    queryKey: tmdbKeys.episodes(id, season),
    queryFn: () => fetchSeasonEpisodes(id, season),
    enabled: enabled && !!id && season > 0,
    staleTime: 10 * 60 * 1000,
  });
}
