import { Link } from "wouter";
import { Star } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export interface MediaItem {
  id: string;
  title: string;
  mediaType: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  overview?: string;
  releaseDate?: string;
  rating?: number | null;
}

interface MediaCardProps {
  media: MediaItem;
  showProgress?: boolean;
  progress?: number;
}

export function MediaCard({ media, showProgress, progress }: MediaCardProps) {
  const imageUrl = media.posterPath
    ? `https://image.tmdb.org/t/p/w500${media.posterPath}`
    : "https://placehold.co/500x750/111/444?text=No+Image";

  const href = `/title/${media.mediaType}/${media.id}`;

  return (
    <Link href={href} className="group relative flex flex-col gap-2 min-w-[140px] md:min-w-[180px] lg:min-w-[220px] transition-transform duration-300 hover:scale-105 origin-center">
      <div className="relative aspect-[2/3] overflow-hidden rounded-md shadow-lg border border-border/20 bg-muted/20">
        <img
          src={imageUrl}
          alt={media.title}
          className="w-full h-full object-cover transition-all duration-300 group-hover:brightness-75"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          <div className="flex items-center gap-1.5 text-primary text-sm font-semibold">
            <Star className="w-4 h-4 fill-current" />
            <span>{media.rating ? media.rating.toFixed(1) : "NR"}</span>
          </div>
          {media.releaseDate && (
            <span className="text-xs text-white/80">{new Date(media.releaseDate).getFullYear()}</span>
          )}
        </div>
      </div>

      {showProgress && progress !== undefined && (
        <div className="w-full px-1">
          <Progress value={progress} className="h-1.5 bg-secondary" indicatorClassName="bg-primary" />
        </div>
      )}

      <div className="px-1">
        <h3 className="font-medium text-sm text-foreground/90 truncate group-hover:text-primary transition-colors">{media.title}</h3>
      </div>
    </Link>
  );
}
