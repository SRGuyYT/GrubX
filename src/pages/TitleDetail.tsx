import { useState } from "react";
import { useRoute } from "wouter";
import { Layout } from "@/components/layout/Layout";
import { TheaterMode } from "@/components/player/TheaterMode";
import { useMediaDetails, useSeasonEpisodes } from "@/hooks/useTmdb";
import { useWatchlist, usePlaybackProgress } from "@/hooks/useUserData";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Play, Plus, Check, Star, Clock, Calendar, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function TitleDetail() {
  const [, params] = useRoute("/title/:mediaType/:id");
  const routeParams = params ?? { mediaType: "movie", id: "" };
  const mediaType = routeParams.mediaType as "movie" | "tv";
  const id = routeParams.id;

  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [selectedEpisode, setSelectedEpisode] = useState<number>(1);

  const { user } = useAuth();

  const { data: media, isLoading, isError } = useMediaDetails(mediaType, id);
  const { data: episodesData } = useSeasonEpisodes(id, selectedSeason, mediaType === "tv");
  const { data: progress } = usePlaybackProgress(id, mediaType);

  const { isInWatchlist, add, remove } = useWatchlist();
  const watchlisted = isInWatchlist(id);

  const toggleWatchlist = () => {
    if (!user) {
      toast.error("Sign in to manage your watchlist.");
      return;
    }
    if (watchlisted) {
      remove(id);
    } else {
      add({
        mediaId: id,
        mediaType,
        title: media?.title ?? "",
        posterPath: media?.posterPath ?? null,
        rating: media?.rating ?? null,
      });
    }
  };

  const handlePlay = (season?: number, episode?: number) => {
    if (season) setSelectedSeason(season);
    if (episode) setSelectedEpisode(episode);
    setIsPlayerOpen(true);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="w-full h-[60vh] bg-muted/20 animate-pulse" />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-1/3 mb-4 bg-muted/20" />
          <Skeleton className="h-6 w-2/3 mb-8 bg-muted/20" />
          <div className="flex gap-4">
            <Skeleton className="h-12 w-32 bg-muted/20" />
            <Skeleton className="h-12 w-32 bg-muted/20" />
          </div>
        </div>
      </Layout>
    );
  }

  if (isError || !media) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Title Not Found</h2>
          <p className="text-muted-foreground">The requested media could not be loaded. GX-NET-001</p>
        </div>
      </Layout>
    );
  }

  const backdropUrl = media.backdropPath
    ? `https://image.tmdb.org/t/p/original${media.backdropPath}`
    : `https://image.tmdb.org/t/p/original${media.posterPath}`;

  const hasProgress = progress && progress.progress > 0 && progress.progress < 95;

  return (
    <Layout>
      <div className="relative w-full min-h-[70vh] flex items-center -mt-16 pt-16 border-b border-border/20">
        <div className="absolute inset-0 bg-black">
          <img src={backdropUrl} alt={media.title} className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent w-full md:w-2/3" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        </div>

        <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center py-12">
          <div className="hidden md:block w-64 shrink-0 rounded-lg overflow-hidden shadow-2xl border border-white/10 relative">
            <img
              src={`https://image.tmdb.org/t/p/w500${media.posterPath}`}
              alt={media.title}
              className="w-full h-auto object-cover"
            />
          </div>

          <div className="flex-1 max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2 tracking-tight">{media.title}</h1>

            {media.tagline && (
              <p className="text-xl text-primary/90 italic mb-4 font-serif">"{media.tagline}"</p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-white/80 mb-6">
              {media.rating ? (
                <div className="flex items-center gap-1 text-primary font-medium">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{media.rating.toFixed(1)}</span>
                </div>
              ) : null}
              {media.releaseDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(media.releaseDate).getFullYear()}</span>
                </div>
              )}
              {media.runtime ? (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{media.runtime} min</span>
                </div>
              ) : null}
              {mediaType === "tv" && media.totalSeasons ? (
                <Badge variant="secondary" className="bg-secondary/50 text-white">
                  {media.totalSeasons} Season{media.totalSeasons > 1 ? "s" : ""}
                </Badge>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {media.genres?.map((genre) => (
                <Badge key={genre} variant="outline" className="border-white/20 text-white/90">
                  {genre}
                </Badge>
              ))}
            </div>

            <p className="text-white/90 text-lg leading-relaxed mb-8 max-w-2xl">{media.overview}</p>

            <div className="flex flex-wrap items-center gap-4">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-8 h-14 rounded-md shadow-[0_0_20px_rgba(229,9,20,0.4)] transition-all hover:scale-105"
                onClick={() =>
                  handlePlay(
                    mediaType === "tv" ? (progress?.season ?? 1) : undefined,
                    mediaType === "tv" ? (progress?.episode ?? 1) : undefined
                  )
                }
              >
                <Play className="w-6 h-6 mr-2 fill-current" />
                {hasProgress ? "Resume" : "Play"}
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="h-14 px-6 border-white/20 text-white hover:bg-white/10"
                onClick={toggleWatchlist}
              >
                {watchlisted ? <Check className="w-5 h-5 mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
                {watchlisted ? "Added to My List" : "My List"}
              </Button>

              {media.trailerKey && (
                <Button
                  size="lg"
                  variant="ghost"
                  className="h-14 px-6 text-white hover:bg-white/10"
                  onClick={() => window.open(`https://youtube.com/watch?v=${media.trailerKey}`, "_blank")}
                >
                  Watch Trailer
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <Tabs defaultValue={mediaType === "tv" ? "episodes" : "cast"} className="w-full">
          <TabsList className="bg-muted/30 border border-border/20 mb-8">
            {mediaType === "tv" && <TabsTrigger value="episodes">Episodes</TabsTrigger>}
            <TabsTrigger value="cast">Cast & Crew</TabsTrigger>
          </TabsList>

          {mediaType === "tv" && (
            <TabsContent value="episodes" className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-semibold">Episodes</h3>
                <Select value={selectedSeason.toString()} onValueChange={(v) => setSelectedSeason(Number(v))}>
                  <SelectTrigger className="w-[180px] bg-card border-border/50">
                    <SelectValue placeholder="Select Season" />
                  </SelectTrigger>
                  <SelectContent>
                    {media.seasons?.map((season) => (
                      <SelectItem key={season.seasonNumber} value={season.seasonNumber.toString()}>
                        Season {season.seasonNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {episodesData?.episodes.map((ep) => (
                  <div
                    key={ep.episodeNumber}
                    className="flex flex-col gap-3 p-4 rounded-lg bg-card/50 border border-border/30 hover:bg-card/80 transition-colors group cursor-pointer"
                    onClick={() => handlePlay(selectedSeason, ep.episodeNumber)}
                  >
                    <div className="relative aspect-video rounded-md overflow-hidden bg-muted">
                      {ep.stillPath ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w500${ep.stillPath}`}
                          alt={ep.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-secondary/50">
                          <Play className="w-8 h-8 text-muted-foreground/50" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <div className="bg-primary/90 rounded-full p-3 shadow-lg">
                          <Play className="w-6 h-6 text-white fill-current" />
                        </div>
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 text-xs rounded font-medium text-white">
                        E{ep.episodeNumber}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground/90 line-clamp-1">
                        {ep.episodeNumber}. {ep.name}
                      </h4>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{ep.overview || "No overview available."}</p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          )}

          <TabsContent value="cast">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {media.cast?.map((person, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <div className="aspect-[2/3] rounded-md overflow-hidden bg-muted/30 relative">
                    {person.profilePath ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w276_and_h350_face${person.profilePath}`}
                        alt={person.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">No Image</div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm leading-tight">{person.name}</p>
                    <p className="text-xs text-muted-foreground leading-tight mt-0.5">{person.character}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {isPlayerOpen && (
        <TheaterMode
          tmdbId={id}
          mediaType={mediaType}
          season={selectedSeason}
          episode={selectedEpisode}
          mediaTitle={media.title}
          mediaPosterPath={media.posterPath}
          mediaBackdropPath={media.backdropPath}
          seasons={media.seasons}
          onClose={() => setIsPlayerOpen(false)}
        />
      )}
    </Layout>
  );
}
