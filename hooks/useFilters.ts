"use client";

import { useMemo, useState } from "react";

export const CONTENT_RATING_OPTIONS = ["G", "PG", "PG-13", "R", "NC-17", "NR"] as const;
export type ContentRatingFilter = (typeof CONTENT_RATING_OPTIONS)[number];

export type FilterOption = {
  id: string;
  name: string;
};

export type FilterState = {
  genres: string[];
  ratings: string[];
  yearFrom: number;
  yearTo: number;
};

export type FilterActions = {
  toggleGenre: (genreId: string) => void;
  toggleRating: (rating: string) => void;
  setYearFrom: (year: number) => void;
  setYearTo: (year: number) => void;
  resetFilters: () => void;
};

export function createYearOptions(startYear = 1980, endYear = new Date().getFullYear()) {
  const years: number[] = [];
  for (let year = endYear; year >= startYear; year -= 1) {
    years.push(year);
  }
  return years;
}

export function useFilters({
  startYear = 1980,
  endYear = new Date().getFullYear(),
}: {
  startYear?: number;
  endYear?: number;
} = {}) {
  const [filters, setFilters] = useState<FilterState>({
    genres: [],
    ratings: [],
    yearFrom: startYear,
    yearTo: endYear,
  });

  const actions: FilterActions = useMemo(
    () => ({
      toggleGenre: (genreId) => {
        setFilters((current) => ({
          ...current,
          genres: current.genres.includes(genreId)
            ? current.genres.filter((id) => id !== genreId)
            : [...current.genres, genreId],
        }));
      },
      toggleRating: (rating) => {
        setFilters((current) => ({
          ...current,
          ratings: current.ratings.includes(rating)
            ? current.ratings.filter((id) => id !== rating)
            : [...current.ratings, rating],
        }));
      },
      setYearFrom: (year) => {
        setFilters((current) => ({ ...current, yearFrom: Math.min(year, current.yearTo) }));
      },
      setYearTo: (year) => {
        setFilters((current) => ({ ...current, yearTo: Math.max(year, current.yearFrom) }));
      },
      resetFilters: () => {
        setFilters({ genres: [], ratings: [], yearFrom: startYear, yearTo: endYear });
      },
    }),
    [endYear, startYear],
  );

  const hasActiveFilters =
    filters.genres.length > 0 ||
    filters.ratings.length > 0 ||
    filters.yearFrom !== startYear ||
    filters.yearTo !== endYear;

  return {
    filters,
    actions,
    yearOptions: createYearOptions(startYear, endYear),
    hasActiveFilters,
  };
}

export function filterByYear<T>(items: T[], filters: Pick<FilterState, "yearFrom" | "yearTo">, getYear: (item: T) => number | null) {
  return items.filter((item) => {
    const year = getYear(item);
    return year === null || (year >= filters.yearFrom && year <= filters.yearTo);
  });
}
