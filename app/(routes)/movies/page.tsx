import { CatalogGrid } from "@/components/media/CatalogGrid";

export default function MoviesPage() {
  return (
    <CatalogGrid
      mediaType="movie"
      title="Movie Library"
      description="CSR pagination, genre resets, and deduped infinite loading for film browsing."
    />
  );
}
