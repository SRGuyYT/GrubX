import { useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/lib/auth-context";
import { useWatchlist, useWatchHistory, useContinueWatching } from "@/hooks/useUserData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MediaCard } from "@/components/media/MediaCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, List, History, User } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function Account() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation("/login");
    }
  }, [user, loading, setLocation]);

  const { data: continueWatching, isLoading: loadCw } = useContinueWatching();
  const { watchlist, isLoading: loadWl } = useWatchlist();
  const { data: history, isLoading: loadHist } = useWatchHistory(20);

  if (loading || !user) return null;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary">
              <User className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{user.username}</h1>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <Link href="/account/settings" className="px-4 py-2 bg-secondary/50 hover:bg-secondary rounded-md font-medium transition-colors">
            Account Settings
          </Link>
        </div>

        <Tabs defaultValue="continue" className="w-full">
          <TabsList className="bg-card border border-border/30 w-full justify-start h-12 mb-8 rounded-lg">
            <TabsTrigger value="continue" className="gap-2 px-6">
              <Clock className="w-4 h-4" /> Continue Watching
            </TabsTrigger>
            <TabsTrigger value="watchlist" className="gap-2 px-6">
              <List className="w-4 h-4" /> My List
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2 px-6">
              <History className="w-4 h-4" /> History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="continue">
            {loadCw ? (
              <MediaGridSkeleton />
            ) : continueWatching && continueWatching.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                {continueWatching.map((item) => (
                  <MediaCard
                    key={item.mediaId}
                    media={{ id: item.mediaId, mediaType: item.mediaType, title: item.title ?? "", posterPath: item.posterPath ?? null, rating: 0 }}
                    showProgress
                    progress={item.progress}
                  />
                ))}
              </div>
            ) : (
              <EmptyState message="No content to continue watching." icon={<Clock className="w-12 h-12 mb-4 opacity-20" />} />
            )}
          </TabsContent>

          <TabsContent value="watchlist">
            {loadWl ? (
              <MediaGridSkeleton />
            ) : watchlist?.items?.length ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                {watchlist.items.map((item) => (
                  <MediaCard
                    key={item.mediaId}
                    media={{ id: item.mediaId, mediaType: item.mediaType, title: item.title, posterPath: item.posterPath ?? null, rating: item.rating ?? 0 }}
                  />
                ))}
              </div>
            ) : (
              <EmptyState message="Your list is empty." icon={<List className="w-12 h-12 mb-4 opacity-20" />} />
            )}
          </TabsContent>

          <TabsContent value="history">
            {loadHist ? (
              <MediaGridSkeleton />
            ) : history?.items?.length ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                {history.items.map((item, i) => (
                  <MediaCard
                    key={`${item.mediaId}-${i}`}
                    media={{ id: item.mediaId, mediaType: item.mediaType, title: item.title, posterPath: item.posterPath ?? null, rating: 0 }}
                    showProgress={item.progress !== null && item.progress !== undefined}
                    progress={item.progress ?? undefined}
                  />
                ))}
              </div>
            ) : (
              <EmptyState message="Your watch history is empty." icon={<History className="w-12 h-12 mb-4 opacity-20" />} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

function MediaGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
      {[...Array(12)].map((_, i) => (
        <Skeleton key={i} className="aspect-[2/3] rounded-md bg-muted/20" />
      ))}
    </div>
  );
}

function EmptyState({ message, icon }: { message: string; icon: React.ReactNode }) {
  return (
    <div className="py-20 text-center flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border/20 rounded-xl bg-card/20">
      {icon}
      <p className="text-lg font-medium">{message}</p>
    </div>
  );
}
