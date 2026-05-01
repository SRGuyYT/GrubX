import type { FilterState } from "@/hooks/useFilters";
import type { LiveMatch } from "@/types/live";
import type { MediaDetails, MediaItem } from "@/types/media";

export type RecommendationItem = {
  id: string;
  title: string;
  genres: string[];
  rating: string | number | null;
  year: number | null;
  mediaType?: string;
  teams?: string[];
  lastInteractedAt?: string;
};

export type RecommendationState = {
  viewedItems: RecommendationItem[];
  clickedItems: RecommendationItem[];
  searchHistory: string[];
  notInterestedItems: RecommendationItem[];
  savedItems: RecommendationItem[];
};

export type ScoredRecommendation<T> = {
  item: T;
  recommendation: RecommendationItem;
  score: number;
};

const STORAGE_KEY = "grubx.recommendations";
export const RECOMMENDATION_EVENT = "grubx:recommendations-updated";

const emptyState: RecommendationState = {
  viewedItems: [],
  clickedItems: [],
  searchHistory: [],
  notInterestedItems: [],
  savedItems: [],
};

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function safeJsonParse(value: string | null): Partial<RecommendationState> | null {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as Partial<RecommendationState>;
  } catch {
    return null;
  }
}

function normalizeItem(item: RecommendationItem): RecommendationItem {
  return {
    id: String(item.id),
    title: item.title || "Untitled",
    genres: Array.from(new Set((item.genres ?? []).map((genre) => String(genre)).filter(Boolean))),
    rating: item.rating ?? null,
    year: typeof item.year === "number" && Number.isFinite(item.year) ? item.year : null,
    mediaType: item.mediaType,
    teams: Array.from(new Set((item.teams ?? []).map((team) => String(team)).filter(Boolean))),
    lastInteractedAt: item.lastInteractedAt,
  };
}

function normalizeState(state: Partial<RecommendationState> | null): RecommendationState {
  return {
    viewedItems: (state?.viewedItems ?? []).map(normalizeItem),
    clickedItems: (state?.clickedItems ?? []).map(normalizeItem),
    searchHistory: (state?.searchHistory ?? []).map((query) => String(query)).filter(Boolean),
    notInterestedItems: (state?.notInterestedItems ?? []).map(normalizeItem),
    savedItems: (state?.savedItems ?? []).map(normalizeItem),
  };
}

function emitRecommendationEvent() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(RECOMMENDATION_EVENT));
  }
}

function saveRecommendationState(state: RecommendationState) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  emitRecommendationEvent();
}

function addRecentItem(items: RecommendationItem[], item: RecommendationItem, limit = 80) {
  const normalized = normalizeItem({ ...item, lastInteractedAt: new Date().toISOString() });
  return [normalized, ...items.filter((entry) => entry.id !== normalized.id || entry.mediaType !== normalized.mediaType)].slice(0, limit);
}

export function getRecommendationState(): RecommendationState {
  if (!canUseStorage()) {
    return emptyState;
  }

  return normalizeState(safeJsonParse(window.localStorage.getItem(STORAGE_KEY)));
}

export function trackViewedItem(item: RecommendationItem) {
  const state = getRecommendationState();
  saveRecommendationState({
    ...state,
    viewedItems: addRecentItem(state.viewedItems, item),
  });
}

export function trackClickedItem(item: RecommendationItem) {
  const state = getRecommendationState();
  saveRecommendationState({
    ...state,
    clickedItems: addRecentItem(state.clickedItems, item),
  });
}

export function trackSearchQuery(query: string) {
  const normalized = query.trim().toLowerCase();
  if (normalized.length < 2) {
    return;
  }

  const state = getRecommendationState();
  saveRecommendationState({
    ...state,
    searchHistory: [normalized, ...state.searchHistory.filter((entry) => entry !== normalized)].slice(0, 30),
  });
}

export function trackNotInterested(item: RecommendationItem) {
  const state = getRecommendationState();
  saveRecommendationState({
    ...state,
    notInterestedItems: addRecentItem(state.notInterestedItems, item, 120),
  });
}

export function trackSavedForLater(item: RecommendationItem) {
  const state = getRecommendationState();
  saveRecommendationState({
    ...state,
    savedItems: addRecentItem(state.savedItems, item, 120),
  });
}

function getReleaseYear(releaseDate: string | null) {
  if (!releaseDate) {
    return null;
  }

  const year = Number(releaseDate.slice(0, 4));
  return Number.isFinite(year) ? year : null;
}

export function mediaItemToRecommendationItem(media: MediaItem): RecommendationItem {
  return normalizeItem({
    id: media.id,
    title: media.title,
    genres: media.genreIds.map((genreId) => String(genreId)),
    rating: media.rating,
    year: getReleaseYear(media.releaseDate),
    mediaType: media.mediaType,
  });
}

export function mediaDetailsToRecommendationItem(media: MediaDetails): RecommendationItem {
  return normalizeItem({
    id: media.id,
    title: media.title,
    genres: media.genres.flatMap((genre) => [String(genre.id), genre.name]),
    rating: media.rating,
    year: getReleaseYear(media.releaseDate),
    mediaType: media.mediaType,
  });
}

export function liveMatchToRecommendationItem(match: LiveMatch): RecommendationItem {
  return normalizeItem({
    id: match.id,
    title: match.title,
    genres: [match.category],
    rating: null,
    year: new Date(match.date).getFullYear(),
    mediaType: "live",
    teams: [match.teams?.home?.name, match.teams?.away?.name].filter(Boolean) as string[],
  });
}

function toSearchableSet(values: string[]) {
  return new Set(values.map((value) => value.trim().toLowerCase()).filter(Boolean));
}

function countOverlap(left: string[] | undefined, right: string[] | undefined) {
  if (!left?.length || !right?.length) {
    return 0;
  }

  const leftSet = toSearchableSet(left);
  return right.reduce((count, value) => count + (leftSet.has(value.trim().toLowerCase()) ? 1 : 0), 0);
}

function ratingsMatch(left: RecommendationItem["rating"], right: RecommendationItem["rating"]) {
  if (left === null || right === null) {
    return false;
  }

  if (typeof left === "number" && typeof right === "number") {
    return Math.abs(left - right) <= 1.5;
  }

  return String(left).toLowerCase() === String(right).toLowerCase();
}

function matchesRatingPreference(item: RecommendationItem, filters: Pick<FilterState, "ratings">) {
  if (!filters.ratings.length || item.rating === null) {
    return false;
  }

  return filters.ratings.some((rating) => String(item.rating).toLowerCase() === rating.toLowerCase());
}

function matchesYearRange(item: RecommendationItem, filters: Pick<FilterState, "yearFrom" | "yearTo">) {
  return item.year !== null && item.year >= filters.yearFrom && item.year <= filters.yearTo;
}

export function getSimilarityScore(item: RecommendationItem, reference: RecommendationItem) {
  let score = 0;
  const genreOverlap = countOverlap(item.genres, reference.genres);
  const teamOverlap = countOverlap(item.teams, reference.teams);

  score += genreOverlap * 2;
  score += teamOverlap * 2;

  if (ratingsMatch(item.rating, reference.rating)) {
    score += 1;
  }

  if (item.year !== null && reference.year !== null && Math.abs(item.year - reference.year) <= 5) {
    score += 1;
  }

  if (item.mediaType && item.mediaType === reference.mediaType) {
    score += 0.5;
  }

  return score;
}

function matchesSearchKeywords(item: RecommendationItem, searchHistory: string[]) {
  if (!searchHistory.length) {
    return false;
  }

  const searchable = `${item.title} ${item.genres.join(" ")} ${(item.teams ?? []).join(" ")}`.toLowerCase();
  return searchHistory.some((query) =>
    query
      .split(/\s+/)
      .filter((word) => word.length > 1)
      .some((word) => searchable.includes(word)),
  );
}

function decayWeight(timestamp?: string) {
  if (!timestamp) {
    return 0.6;
  }

  const ageDays = Math.max(0, (Date.now() - new Date(timestamp).getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0.2, Math.exp(-ageDays / 30));
}

export function scoreRecommendationItem(
  item: RecommendationItem,
  filters: FilterState,
  state: RecommendationState,
) {
  let score = 0;

  if (filters.genres.length > 0 && countOverlap(item.genres, filters.genres) > 0) {
    score += 5;
  }

  if (matchesRatingPreference(item, filters)) {
    score += 3;
  }

  if (matchesYearRange(item, filters)) {
    score += 2;
  }

  const viewedSimilarity = Math.max(
    0,
    ...state.viewedItems.map((viewed) => getSimilarityScore(item, viewed) * decayWeight(viewed.lastInteractedAt)),
  );
  if (viewedSimilarity > 0) {
    score += 4;
  }

  const clickedSimilarity = Math.max(
    0,
    ...state.clickedItems.map((clicked) => getSimilarityScore(item, clicked) * decayWeight(clicked.lastInteractedAt)),
  );
  if (clickedSimilarity > 0) {
    score += 3;
  }

  if (matchesSearchKeywords(item, state.searchHistory)) {
    score += 2;
  }

  const notInterestedSimilarity = Math.max(0, ...state.notInterestedItems.map((entry) => getSimilarityScore(item, entry)));
  if (state.notInterestedItems.some((entry) => entry.id === item.id && entry.mediaType === item.mediaType)) {
    score -= 100;
  } else if (notInterestedSimilarity > 0) {
    score -= 8;
  }

  const savedSimilarity = Math.max(
    0,
    ...state.savedItems.map((entry) => getSimilarityScore(item, entry) * decayWeight(entry.lastInteractedAt)),
  );
  if (state.savedItems.some((entry) => entry.id === item.id && entry.mediaType === item.mediaType)) {
    score += 6;
  } else if (savedSimilarity > 0) {
    score += 4;
  }

  return score;
}

export function rankRecommendations<T>(
  items: T[],
  filters: FilterState,
  state: RecommendationState,
  toRecommendationItem: (item: T) => RecommendationItem,
) {
  return items
    .map<ScoredRecommendation<T>>((item) => {
      const recommendation = toRecommendationItem(item);
      return {
        item,
        recommendation,
        score: scoreRecommendationItem(recommendation, filters, state),
      };
    })
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score);
}

export function getLatestViewedItem(state: RecommendationState, mediaType?: string) {
  return state.viewedItems.find((item) => !mediaType || item.mediaType === mediaType) ?? null;
}

export function getTopGenres(state: RecommendationState, filters: Pick<FilterState, "genres">, limit = 5) {
  if (filters.genres.length) {
    return filters.genres;
  }

  const counts = new Map<string, number>();
  [...state.viewedItems, ...state.clickedItems, ...state.savedItems].forEach((item) => {
    item.genres.forEach((genre) => {
      const normalized = genre.trim().toLowerCase();
      if (normalized) {
        counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
      }
    });
  });

  return Array.from(counts.entries())
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit)
    .map(([genre]) => genre);
}
