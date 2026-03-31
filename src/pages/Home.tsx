import { Layout } from "@/components/layout/Layout";
import { MediaCarousel } from "@/components/media/MediaCarousel";
import { useTrendingMedia, usePopularMedia, useTopRatedMedia } from "@/hooks/useTmdb";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Play, Info } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { data: trending, isLoading: loadTrending } = useTrendingMedia("all", "day");
  const { data: popularMovies, isLoading: loadPopMovies } = usePopularMedia("movie");
  const { data: popularTv, isLoading: loadPopTv } = usePopularMedia("tv");
  const { data: topRated, isLoading: loadTopRated } = useTopRatedMedia("movie");

  const heroItem = trending?.results?.[0];

  return (
    <Layout>
      <div className="relative w-full h-[70vh] md:h-[85vh] bg-black overflow-hidden -mt-16">
        {loadTrending || !heroItem ? (
          <Skeleton className="w-full h-full bg-muted/20" />
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent z-10 w-3/4 md:w-1/2" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent z-10 h-full" />

            <img
              src={`https://image.tmdb.org/t/p/original${heroItem.backdropPath || heroItem.posterPath}`}
              alt={heroItem.title}
              className="absolute inset-0 w-full h-full object-cover opacity-60"
            />

            <div className="absolute bottom-[15%] left-4 md:left-12 z-20 max-w-2xl">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 tracking-tight drop-shadow-lg">
                {heroItem.title}
              </h1>
              <p className="text-white/80 text-sm md:text-lg mb-6 line-clamp-3">{heroItem.overview}</p>
              <div className="flex items-center gap-4">
                <Link href={`/title/${heroItem.mediaType}/${heroItem.id}`}>
                  <Button size="lg" className="bg-white text-black hover:bg-white/80 font-semibold gap-2 rounded-md">
                    <Play className="w-5 h-5 fill-current" />
                    Play Now
                  </Button>
                </Link>
                <Link href={`/title/${heroItem.mediaType}/${heroItem.id}`}>
                  <Button size="lg" variant="secondary" className="bg-secondary/50 hover:bg-secondary/70 text-white backdrop-blur-sm gap-2 rounded-md border-0">
                    <Info className="w-5 h-5" />
                    More Info
                  </Button>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="container mx-auto pb-20 -mt-24 relative z-20 flex flex-col gap-4">
        {loadTrending ? <CarouselSkeleton /> : <MediaCarousel title="Trending Today" items={trending?.results.slice(1) || []} />}
        {loadPopMovies ? <CarouselSkeleton /> : <MediaCarousel title="Popular Movies" items={popularMovies?.results || []} />}
        {loadPopTv ? <CarouselSkeleton /> : <MediaCarousel title="Popular TV Shows" items={popularTv?.results || []} />}
        {loadTopRated ? <CarouselSkeleton /> : <MediaCarousel title="Critically Acclaimed" items={topRated?.results || []} />}
      </div>
    </Layout>
  );
}

function CarouselSkeleton() {
  return (
    <div className="py-6 px-4 md:px-8">
      <Skeleton className="h-8 w-48 mb-4 bg-muted/20" />
      <div className="flex gap-4 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="min-w-[140px] md:min-w-[180px] lg:min-w-[220px] aspect-[2/3] rounded-md bg-muted/20" />
        ))}
      </div>
    </div>
  );
}
