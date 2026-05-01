import { GRUBX_PROVIDERS } from "@/lib/grubx/providers";

export const appConfig = {
  SAFE_MODE: true,
  providers: GRUBX_PROVIDERS,
  whitelist: [
    "localhost",
    "127.0.0.1",
    "grubx.local",
    "open.spotify.com",
    "spotify.com",
    "youtube.com",
    "www.youtube.com",
    "youtu.be",
    "youtube-nocookie.com",
    "www.youtube-nocookie.com",
    "audiomack.com",
    "www.audiomack.com",
  ],
  featureFlags: {
    recommendations: true,
    externalMedia: true,
    liveSports: true,
    customProviders: true,
  },
} as const;
