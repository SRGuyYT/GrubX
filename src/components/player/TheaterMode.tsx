import { useEffect, useRef, useState } from "react";
import { AlertCircle, Maximize, Minimize, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSeasonEpisodes } from "@/hooks/useTmdb";
import { useSettings, useSaveProgress } from "@/hooks/useUserData";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

const VIDKING_BASE = import.meta.env.VITE_VIDKING_BASE ?? "https://www.vidking.net/embed";

interface Season {
  seasonNumber: number;
  name: string;
  episodeCount: number;
  posterPath?: string | null;
}

interface TheaterModeProps {
  tmdbId: string;
  mediaType: "movie" | "tv";
  season?: number;
  episode?: number;
  mediaTitle?: string;
  mediaPosterPath?: string | null;
  mediaBackdropPath?: string | null;
  seasons?: Season[];
  onClose: () => void;
}

export function TheaterMode({
  tmdbId,
  mediaType,
  season: initialSeason = 1,
  episode: initialEpisode = 1,
  mediaTitle,
  mediaPosterPath,
  mediaBackdropPath,
  seasons,
  onClose,
}: TheaterModeProps) {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSeason, setCurrentSeason] = useState(initialSeason);
  const [currentEpisode, setCurrentEpisode] = useState(initialEpisode);

  const lastSaveRef = useRef<number>(0);

  const { user } = useAuth();
  const { settings } = useSettings();
  const saveProgress = useSaveProgress();

  const { data: episodesData } = useSeasonEpisodes(tmdbId, currentSeason, mediaType === "tv");

  const getEmbedUrl = () => {
    const autoNext = settings?.autoNextEpisode ?? true;
    if (mediaType === "movie") {
      return `${VIDKING_BASE}/movie/${tmdbId}?color=e50914&autoPlay=true`;
    }
    return `${VIDKING_BASE}/tv/${tmdbId}/${currentSeason}/${currentEpisode}?color=e50914&autoPlay=true&nextEpisode=${autoNext}&episodeSelector=true`;
  };

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === "PLAYER_EVENT") {
        const { event, currentTime, duration } = e.data.data ?? {};
        if (event === "timeupdate" && duration > 0) {
          const now = Date.now();
          if (now - lastSaveRef.current > 10000 && user) {
            const progress = Math.round((currentTime / duration) * 100);
            saveProgress.mutate({
              mediaId: tmdbId,
              mediaType,
              currentTime,
              duration,
              progress,
              season: mediaType === "tv" ? currentSeason : null,
              episode: mediaType === "tv" ? currentEpisode : null,
              title: mediaTitle ?? null,
              posterPath: mediaPosterPath ?? null,
              backdropPath: mediaBackdropPath ?? null,
            });
            lastSaveRef.current = now;
          }
        } else if (event === "ended" && mediaType === "tv" && settings?.autoNextEpisode && episodesData) {
          const nextEp = episodesData.episodes.find((ep) => ep.episodeNumber === currentEpisode + 1);
          if (nextEp) {
            setCurrentEpisode(nextEp.episodeNumber);
            setIframeLoaded(false);
          }
        }
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (isTheaterMode) {
        setIsTheaterMode(false);
        return;
      }
      onClose();
    };

    window.addEventListener("message", handleMessage);
    window.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "auto";
    };
  }, [
    tmdbId,
    mediaType,
    currentSeason,
    currentEpisode,
    user,
    saveProgress,
    onClose,
    settings?.autoNextEpisode,
    episodesData,
    mediaTitle,
    mediaPosterPath,
    mediaBackdropPath,
    isTheaterMode,
  ]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center p-4 transition-colors duration-300",
        isTheaterMode ? "bg-black/95" : "bg-black/80 backdrop-blur-sm",
      )}
    >
      {!isTheaterMode && (
        <button
          type="button"
          aria-label="Close player backdrop"
          className="absolute inset-0 cursor-default"
          onClick={onClose}
        />
      )}

      <div
        className={cn(
          "relative overflow-hidden bg-black transition-all duration-300",
          isTheaterMode
            ? "h-full w-full rounded-none"
            : "aspect-video w-[min(94vw,1280px)] rounded-2xl border border-white/10 shadow-[0_30px_120px_rgba(0,0,0,0.65)]",
        )}
      >
        <div className="absolute inset-x-0 top-0 z-20 p-4 bg-gradient-to-b from-black/90 via-black/55 to-transparent pointer-events-none">
          <div className="flex flex-wrap items-start justify-between gap-3 pointer-events-auto">
            <div className="flex flex-wrap items-center gap-3">
              {mediaTitle && (
                <div>
                  <h3 className="text-white font-bold text-lg sm:text-xl drop-shadow-md">{mediaTitle}</h3>
                  <p className="text-xs uppercase tracking-[0.25em] text-white/50">
                    {mediaType === "tv" ? `Season ${currentSeason} Episode ${currentEpisode}` : "Movie Playback"}
                  </p>
                </div>
              )}

              {mediaType === "tv" && (
                <div className="flex items-center gap-2">
                  <Select
                    value={currentSeason.toString()}
                    onValueChange={(v) => {
                      setCurrentSeason(Number(v));
                      setCurrentEpisode(1);
                      setIframeLoaded(false);
                    }}
                  >
                    <SelectTrigger className="w-[120px] bg-black/50 border-white/20 text-white h-9 backdrop-blur-md">
                      <SelectValue placeholder="Season" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 border-white/20 text-white">
                      {(seasons ?? []).map((season) => (
                        <SelectItem key={season.seasonNumber} value={season.seasonNumber.toString()}>
                          Season {season.seasonNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={currentEpisode.toString()}
                    onValueChange={(v) => {
                      setCurrentEpisode(Number(v));
                      setIframeLoaded(false);
                    }}
                  >
                    <SelectTrigger className="w-[120px] bg-black/50 border-white/20 text-white h-9 backdrop-blur-md">
                      <SelectValue placeholder="Episode" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 border-white/20 text-white max-h-64">
                      {episodesData?.episodes.map((ep) => (
                        <SelectItem key={ep.episodeNumber} value={ep.episodeNumber.toString()}>
                          Ep {ep.episodeNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => setIsTheaterMode((value) => !value)}
                className="text-white bg-black/40 hover:bg-black/80 rounded-full h-11 px-4 backdrop-blur-md border border-white/10"
              >
                {isTheaterMode ? <Minimize className="h-4 w-4 mr-2" /> : <Maximize className="h-4 w-4 mr-2" />}
                {isTheaterMode ? "Exit Theater" : "Theater Mode"}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-white bg-black/40 hover:bg-black/80 rounded-full h-11 w-11 backdrop-blur-md border border-white/10"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>

        <div className="relative h-full w-full bg-black">
          {!iframeLoaded && !error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-white/70 font-medium tracking-wide">
                Loading {mediaType === "tv" ? `S${currentSeason} E${currentEpisode}` : "secure stream"}...
              </p>
            </div>
          )}

          {error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black text-center px-4 z-10">
              <AlertCircle className="w-16 h-16 text-destructive mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Playback Error</h2>
              <p className="text-muted-foreground mb-1 max-w-md">{error}</p>
              <p className="text-xs text-muted-foreground/50 font-mono mb-6">ERR: {error.split(":")[0]}</p>
              <Button
                onClick={() => {
                  setError(null);
                  setIframeLoaded(false);
                }}
                variant="outline"
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Retry Connection
              </Button>
            </div>
          ) : (
            <iframe
              src={getEmbedUrl()}
              className={`h-full w-full border-none transition-opacity duration-1000 ${iframeLoaded ? "opacity-100" : "opacity-0"}`}
              allowFullScreen
              allow="autoplay; fullscreen"
              onLoad={() => setIframeLoaded(true)}
              onError={() =>
                setError("GX-PLAYER-001: Iframe failed to load. The streaming server might be temporarily unavailable.")
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
