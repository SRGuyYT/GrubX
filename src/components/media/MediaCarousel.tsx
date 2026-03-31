import { useRef } from "react";
import { MediaCard, type MediaItem } from "./MediaCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MediaCarouselProps {
  title: string;
  items: MediaItem[];
  showProgress?: boolean;
}

export function MediaCarousel({ title, items, showProgress }: MediaCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth * 0.75 : scrollLeft + clientWidth * 0.75;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="relative py-6 group/carousel">
      <h2 className="text-xl md:text-2xl font-semibold mb-4 px-4 md:px-8 tracking-tight text-foreground/90">{title}</h2>

      <div className="relative">
        <div ref={scrollRef} className="flex gap-4 overflow-x-auto smooth-scroll no-scrollbar px-4 md:px-8 pb-4">
          {items.map((item) => (
            <MediaCard key={`${item.mediaType}-${item.id}`} media={item} showProgress={showProgress} />
          ))}
        </div>

        <div className="absolute top-0 bottom-0 left-0 w-16 bg-gradient-to-r from-background to-transparent opacity-0 group-hover/carousel:opacity-100 transition-opacity pointer-events-none flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="ml-2 pointer-events-auto rounded-full bg-background/50 hover:bg-background/80 hover:text-primary border border-border/50 text-foreground"
            onClick={() => scroll("left")}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
        </div>

        <div className="absolute top-0 bottom-0 right-0 w-16 bg-gradient-to-l from-background to-transparent opacity-0 group-hover/carousel:opacity-100 transition-opacity pointer-events-none flex items-center justify-end">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 pointer-events-auto rounded-full bg-background/50 hover:bg-background/80 hover:text-primary border border-border/50 text-foreground"
            onClick={() => scroll("right")}
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}
