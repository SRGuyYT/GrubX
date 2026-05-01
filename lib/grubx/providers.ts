import { appendPlaybackOptions } from "@/lib/grubx/params";
import type { GrubXMediaType, GrubXProvider, GrubXProviderId, GrubXProviderSafety, PlaybackOptions } from "@/types/grubx";

const createProvider = (
  id: GrubXProviderId,
  name: string,
  baseUrl: string,
  capabilities: GrubXProvider["capabilities"],
  options: {
    enabled?: boolean;
    safety?: GrubXProviderSafety;
    priority: number;
    supportsMovie?: boolean;
    supportsTv?: boolean;
    compatibilityMode?: boolean;
    notes?: string;
  },
): GrubXProvider => ({
  id,
  name,
  baseUrl,
  enabled: options.enabled ?? true,
  safety: options.safety ?? "compatibility",
  priority: options.priority,
  supportsMovie: options.supportsMovie ?? true,
  supportsTv: options.supportsTv ?? true,
  compatibilityMode: options.compatibilityMode ?? true,
  notes: options.notes,
  capabilities,
  movie(mediaId, options) {
    return appendPlaybackOptions(`${baseUrl}/movie/${encodeURIComponent(mediaId)}`, options);
  },
  tv(mediaId, season, episode, options) {
    return appendPlaybackOptions(
      `${baseUrl}/tv/${encodeURIComponent(mediaId)}/${season}/${episode}`,
      options,
    );
  },
  anime(mediaId, episode, options) {
    const path =
      typeof episode === "number"
        ? `${baseUrl}/anime/${encodeURIComponent(mediaId)}/${episode}`
        : `${baseUrl}/anime/${encodeURIComponent(mediaId)}`;
    return appendPlaybackOptions(path, options);
  },
});

const standardCapabilities = {
  subtitles: true,
  quality: true,
  casting: false,
};

const REPORTED_PROVIDER_NOTES = "Reported by users for popup or unsafe ad behavior. Use a trusted ad blocker.";

const appendVidKingPlaybackOptions = (url: string, options?: PlaybackOptions) => {
  if (!options) {
    return url;
  }

  const parsed = new URL(url);
  if (options.color) parsed.searchParams.set("color", options.color);
  if (options.autoplay ?? options.autoPlay) parsed.searchParams.set("autoPlay", options.autoplay ?? options.autoPlay ?? "true");
  if (options.nextEpisode) parsed.searchParams.set("nextEpisode", options.nextEpisode);
  if (options.episodeSelector) parsed.searchParams.set("episodeSelector", options.episodeSelector);
  if (options.startAt ?? options.progress) parsed.searchParams.set("progress", options.startAt ?? options.progress ?? "0");
  return parsed.toString();
};

export const GRUBX_PROVIDERS = [
  createProvider("vidfast", "vidfast.pro", "https://vidfast.pro", standardCapabilities, {
    enabled: true,
    safety: "reported",
    priority: 90,
    compatibilityMode: true,
    notes: REPORTED_PROVIDER_NOTES,
  }),
  createProvider("vidfast-pro", "vidfast.pro", "https://vidfast.pro", standardCapabilities, {
    enabled: true,
    safety: "reported",
    priority: 91,
    compatibilityMode: true,
    notes: REPORTED_PROVIDER_NOTES,
  }),
  {
    id: "vidking",
    name: "www.vidking.net",
    baseUrl: "https://www.vidking.net/embed",
    enabled: true,
    safety: "standard",
    priority: 1,
    supportsMovie: true,
    supportsTv: true,
    compatibilityMode: true,
    capabilities: {
      subtitles: true,
      quality: true,
      casting: false,
    },
    movie(mediaId, options) {
      return appendVidKingPlaybackOptions(
        `https://www.vidking.net/embed/movie/${encodeURIComponent(mediaId)}`,
        options,
      );
    },
    tv(mediaId, season, episode, options) {
      return appendVidKingPlaybackOptions(
        `https://www.vidking.net/embed/tv/${encodeURIComponent(mediaId)}/${season}/${episode}`,
        options,
      );
    },
  },
  createProvider("vidfast-in", "vidfast.in", "https://vidfast.in", standardCapabilities, { safety: "compatibility", priority: 3 }),
  createProvider("vidfast-io", "vidfast.io", "https://vidfast.io", standardCapabilities, { safety: "compatibility", priority: 4 }),
  createProvider("vidfast-me", "vidfast.me", "https://vidfast.me", standardCapabilities, { safety: "compatibility", priority: 5 }),
  createProvider("vidfast-net", "vidfast.net", "https://vidfast.net", standardCapabilities, { safety: "compatibility", priority: 6 }),
  createProvider("vidfast-pm", "vidfast.pm", "https://vidfast.pm", standardCapabilities, { safety: "compatibility", priority: 7 }),
  createProvider("vidfast-xyz", "vidfast.xyz", "https://vidfast.xyz", standardCapabilities, { safety: "compatibility", priority: 8 }),
  createProvider("vidcore", "vidcore.net", "https://vidcore.net", standardCapabilities, {
    enabled: true,
    safety: "reported",
    priority: 92,
    compatibilityMode: true,
    notes: REPORTED_PROVIDER_NOTES,
  }),
  createProvider("vidlink", "vidlink.pro", "https://vidlink.pro", standardCapabilities, { safety: "compatibility", priority: 10 }),
  createProvider("vidfun", "vidfun.pro", "https://vidfun.pro", standardCapabilities, { safety: "compatibility", priority: 11 }),
  createProvider("vidrock", "vidrock.net", "https://vidrock.net", standardCapabilities, { safety: "compatibility", priority: 12 }),
  createProvider("videasy", "player.videasy.net", "https://player.videasy.net", {
    subtitles: true,
    quality: true,
    casting: true,
  }, { safety: "compatibility", priority: 13 }),
  createProvider("zxcstream", "zxcstream.xyz", "https://zxcstream.xyz", standardCapabilities, { safety: "compatibility", priority: 14 }),
] satisfies GrubXProvider[];

export const DEFAULT_GRUBX_PROVIDER: GrubXProviderId = "vidking";

export const getGrubXProvider = (providerId: string) => {
  const normalized = providerId.trim().toLowerCase();
  return GRUBX_PROVIDERS.find((provider) => provider.id === normalized);
};

export const getProviderById = getGrubXProvider;

export function isProviderAllowed(providerId: string, _options?: { allowLimitedProtectionProviders?: boolean }) {
  const provider = getProviderById(providerId);
  return Boolean(provider && provider.enabled);
}

export function getEnabledProviders(mediaType: "movie" | "tv", _options?: { allowLimitedProtectionProviders?: boolean }) {
  return GRUBX_PROVIDERS
    .filter((provider) => provider.enabled)
    .filter((provider) => (mediaType === "movie" ? provider.supportsMovie : provider.supportsTv))
    .sort((a, b) => a.priority - b.priority);
}

export function scoreServerCandidate(input: {
  safety: GrubXProviderSafety;
  priority: number;
  latencyMs: number | null;
  previousSuccess?: boolean;
  previousFailure?: boolean;
  localReports?: number;
}) {
  let score = 100;

  if (input.safety === "standard") score += 18;
  if (input.safety === "compatibility") score += 6;
  if (input.safety === "reported") score -= 12;

  score += Math.max(0, 20 - input.priority * 2);

  if (typeof input.latencyMs === "number") {
    if (input.latencyMs < 250) score += 25;
    else if (input.latencyMs < 500) score += 15;
    else if (input.latencyMs < 1000) score += 8;
    else score -= 10;
  }

  if (input.previousSuccess) score += 20;
  if (input.previousFailure) score -= 35;

  if (input.localReports) {
    score -= input.localReports * 50;
  }

  return score;
}

export const assertGrubXProvider = (providerId: string) => {
  const provider = getGrubXProvider(providerId);
  if (!provider || !isProviderAllowed(provider.id)) {
    throw new Error("Unsupported GrubX provider.");
  }
  return provider;
};

export const resolveGrubXProviderUrl = (
  providerId: string,
  type: GrubXMediaType,
  id: string,
  season?: number,
  episode?: number,
  options?: PlaybackOptions,
) => {
  const provider = assertGrubXProvider(providerId);

  if (type === "movie") {
    return provider.movie(id, options);
  }

  if (type === "tv") {
    if (!season || !episode) {
      throw new Error("TV embeds require season and episode.");
    }
    return provider.tv(id, season, episode, options);
  }

  if (!provider.anime) {
    throw new Error("Provider does not support anime embeds.");
  }
  return provider.anime(id, episode, options);
};

export const buildGrubXEmbedPath = ({
  provider,
  type,
  id,
  season,
  episode,
  options,
}: {
  provider: string;
  type: GrubXMediaType;
  id: string;
  season?: number;
  episode?: number;
  options?: PlaybackOptions;
}) => {
  const params = new URLSearchParams();
  Object.entries(options ?? {}).forEach(([key, value]) => {
    if (typeof value === "string" && value.length > 0) {
      params.set(key, value);
    }
  });
  const suffix = params.size > 0 ? `?${params.toString()}` : "";

  if (type === "movie") {
    return `/embed/movie/${provider}/${encodeURIComponent(id)}${suffix}`;
  }

  if (type === "tv") {
    return `/embed/tv/${provider}/${encodeURIComponent(id)}/${season ?? 1}/${episode ?? 1}${suffix}`;
  }

  return `/embed/anime/${provider}/${encodeURIComponent(id)}${episode ? `/${episode}` : ""}${suffix}`;
};
