"use client";

import { type FormEvent, useState } from "react";
import { Music } from "lucide-react";

import { ExternalEmbedFrame } from "@/components/media/ExternalEmbedFrame";
import type { SpotifyEmbedType } from "@/types/external";

const SPOTIFY_TYPES: SpotifyEmbedType[] = ["track", "album", "playlist", "artist", "episode", "show"];

function parseSpotifyEmbedUrl(value: string) {
  try {
    const url = new URL(value.trim());
    if (!/(^|\.)spotify\.com$/i.test(url.hostname)) {
      return null;
    }

    const parts = url.pathname.split("/").filter(Boolean);
    const type = parts[0] as SpotifyEmbedType | undefined;
    const id = parts[1]?.split("?")[0];
    if (!type || !id || !SPOTIFY_TYPES.includes(type)) {
      return null;
    }

    return `https://open.spotify.com/embed/${type}/${encodeURIComponent(id)}`;
  } catch {
    return null;
  }
}

export function SpotifyConsole() {
  const [url, setUrl] = useState("");
  const [embedUrl, setEmbedUrl] = useState("");
  const [error, setError] = useState("");
  const [spotifyFailed, setSpotifyFailed] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [retryToken, setRetryToken] = useState(0);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextEmbed = parseSpotifyEmbedUrl(url);
    if (!nextEmbed) {
      setError("Paste a Spotify track, album, playlist, artist, episode, or show URL.");
      setEmbedUrl("");
      return;
    }

    setError("");
    setSpotifyFailed(false);
    setShowFallback(false);
    setRetryToken((value) => value + 1);
    setEmbedUrl(nextEmbed);
  };

  return (
    <section className="page-shell space-y-8">
      <div className="max-w-3xl">
        <div className="flex items-center gap-3">
          <Music className="size-5 text-[var(--accent)]" />
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--accent)]">Spotify</p>
        </div>
        <h1 className="mt-4 text-4xl font-bold text-white md:text-6xl">Embed Spotify in GrubX</h1>
        <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
          Paste a public Spotify link for a track, album, playlist, artist, episode, or show.
        </p>
        <form onSubmit={submit} className="mt-7 flex flex-col gap-3 sm:flex-row">
          <input
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://open.spotify.com/track/..."
            className="min-h-11 flex-1 rounded-full border border-white/10 bg-black/40 px-5 py-3 text-sm text-white outline-none placeholder:text-[var(--muted)]"
          />
          <button
            type="submit"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition hover:brightness-95"
          >
            Open
          </button>
        </form>
        {error ? <p className="mt-4 text-sm text-red-200">{error}</p> : null}
      </div>

      <div className="min-h-[360px] overflow-hidden rounded-[1rem] border border-white/10 bg-black">
        {embedUrl ? (
          <ExternalEmbedFrame
            key={`${embedUrl}-${retryToken}`}
            src={embedUrl}
            title="Spotify embed"
            className="h-[420px] w-full border-0"
            onError={() => setSpotifyFailed(true)}
          />
        ) : (
          <div className="grid min-h-[360px] place-items-center px-6 text-center text-sm text-[var(--muted)]">
            Your Spotify embed will appear here.
          </div>
        )}
      </div>

      {embedUrl ? (
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              setSpotifyFailed(false);
              setRetryToken((value) => value + 1);
            }}
            className="rounded-full bg-white px-5 py-3 text-sm font-bold text-black transition hover:brightness-95"
          >
            Retry Spotify
          </button>
          <button
            type="button"
            onClick={() => setShowFallback((value) => !value)}
            className="rounded-full border border-white/10 bg-white/6 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/20"
          >
            Spotify not working? Try this instead
          </button>
          <a
            href={url || "https://open.spotify.com/"}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-white/10 bg-white/6 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/20"
          >
            Open as link
          </a>
        </div>
      ) : null}

      {spotifyFailed || showFallback ? (
        <div className="liquid-glass-soft overflow-hidden rounded-[1rem] border border-white/10 bg-white/[0.035]">
          <div className="border-b border-white/10 px-5 py-4">
            <p className="text-sm font-semibold text-white">Spotify not working? Try this instead</p>
          </div>
          <ExternalEmbedFrame src="https://audiomack.com/" title="Audiomack fallback" className="h-[440px] w-full border-0" />
          <div className="border-t border-white/10 px-5 py-4">
            <a
              href="https://audiomack.com/"
              target="_blank"
              rel="noreferrer"
              className="text-sm font-semibold text-white underline decoration-white/30 underline-offset-4"
            >
              Open Audiomack as a link
            </a>
          </div>
        </div>
      ) : null}
    </section>
  );
}
