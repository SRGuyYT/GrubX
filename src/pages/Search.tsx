import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useSearchMedia } from "@/hooks/useTmdb";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon, Loader2, Film, Tv, LayoutGrid } from "lucide-react";
import { MediaCard } from "@/components/media/MediaCard";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useDebounce } from "@/hooks/use-debounce";

type MediaType = "all" | "movie" | "tv";

export default function Search() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 500);
  const [type, setType] = useState<MediaType>("all");

  const { data, isLoading, isFetching } = useSearchMedia(debouncedQuery, type);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <SearchIcon className="h-6 w-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
            </div>
            <Input
              type="text"
              placeholder="Search movies, TV shows..."
              className="w-full pl-12 pr-4 py-8 text-xl md:text-2xl bg-card border-border/50 focus-visible:ring-primary rounded-xl shadow-lg"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            {isFetching && (
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                <Loader2 className="h-6 w-6 text-primary animate-spin" />
              </div>
            )}
          </div>

          <div className="flex justify-center">
            <ToggleGroup
              type="single"
              value={type}
              onValueChange={(v) => v && setType(v as MediaType)}
              className="bg-card/50 p-1 rounded-lg border border-border/30"
            >
              <ToggleGroupItem value="all" aria-label="All" className="px-6 py-2">
                <LayoutGrid className="h-4 w-4 mr-2" />
                All
              </ToggleGroupItem>
              <ToggleGroupItem value="movie" aria-label="Movies" className="px-6 py-2">
                <Film className="h-4 w-4 mr-2" />
                Movies
              </ToggleGroupItem>
              <ToggleGroupItem value="tv" aria-label="TV Shows" className="px-6 py-2">
                <Tv className="h-4 w-4 mr-2" />
                TV Shows
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {debouncedQuery.length <= 1 && (
            <div className="text-center py-20 text-muted-foreground">
              <SearchIcon className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <h2 className="text-xl font-medium">Find your next favorite</h2>
              <p>Search across thousands of movies and TV shows.</p>
            </div>
          )}

          {debouncedQuery.length > 1 && data?.results.length === 0 && !isLoading && (
            <div className="text-center py-20 text-muted-foreground">
              <h2 className="text-xl font-medium mb-2">No results found for "{debouncedQuery}"</h2>
              <p>Try adjusting your search or filters.</p>
            </div>
          )}
        </div>

        {data && data.results.length > 0 && (
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {data.results.map((item) => (
              <MediaCard key={`${item.mediaType}-${item.id}`} media={item} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
