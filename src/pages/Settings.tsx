import { useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/lib/auth-context";
import { useSettings } from "@/hooks/useUserData";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Shield, PlayCircle, Bell, Palette } from "lucide-react";
import { useLocation } from "wouter";

export default function Settings() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const { settings, isLoading, updateSettings } = useSettings();

  useEffect(() => {
    if (!loading && !user) {
      setLocation("/login");
    }
  }, [user, loading, setLocation]);

  if (loading || !user) return null;

  if (isLoading || !settings) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <Skeleton className="w-full max-w-2xl mx-auto h-96 bg-muted/20 rounded-lg" />
        </div>
      </Layout>
    );
  }

  const handleToggle = (key: keyof typeof settings) => (checked: boolean) => {
    updateSettings(
      { [key]: checked },
      {
        onSuccess: () => toast.success("Settings updated"),
      }
    );
  };

  const handleThemeChange = (value: string) => {
    updateSettings(
      { theme: value as "dark" | "light" | "system" },
      {
        onSuccess: () => {
          toast.success("Theme updated");
          if (value === "dark") {
            document.documentElement.classList.add("dark");
          } else if (value === "light") {
            document.documentElement.classList.remove("dark");
          }
        },
      }
    );
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8 tracking-tight">Preferences</h1>

        <div className="space-y-8 bg-card/30 p-8 rounded-xl border border-border/30 shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-border/20 pb-2 mb-4">
              <Palette className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Appearance</h2>
            </div>
            <RadioGroup defaultValue={settings.theme} onValueChange={handleThemeChange} className="flex gap-4">
              <div className="flex items-center space-x-2 bg-background/50 border border-border/50 p-3 rounded-lg flex-1">
                <RadioGroupItem value="dark" id="dark" />
                <Label htmlFor="dark" className="cursor-pointer">Dark Mode</Label>
              </div>
              <div className="flex items-center space-x-2 bg-background/50 border border-border/50 p-3 rounded-lg flex-1">
                <RadioGroupItem value="light" id="light" />
                <Label htmlFor="light" className="cursor-pointer">Light Mode</Label>
              </div>
              <div className="flex items-center space-x-2 bg-background/50 border border-border/50 p-3 rounded-lg flex-1">
                <RadioGroupItem value="system" id="system" />
                <Label htmlFor="system" className="cursor-pointer">System</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-border/20 pb-2 mb-4">
              <PlayCircle className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Playback</h2>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Autoplay Previews</Label>
                <p className="text-sm text-muted-foreground">Automatically play trailers while browsing.</p>
              </div>
              <Switch checked={settings.autoplay} onCheckedChange={handleToggle("autoplay")} />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Auto-Play Next Episode</Label>
                <p className="text-sm text-muted-foreground">Start the next episode automatically.</p>
              </div>
              <Switch checked={settings.autoNextEpisode} onCheckedChange={handleToggle("autoNextEpisode")} />
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-border/20 pb-2 mb-4">
              <Shield className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Security & Privacy</h2>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Popup Blocker</Label>
                <p className="text-sm text-muted-foreground">Block malicious popups and redirects from streaming sources.</p>
              </div>
              <Switch checked={settings.blockPopups} onCheckedChange={handleToggle("blockPopups")} />
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-border/20 pb-2 mb-4">
              <Bell className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Notifications</h2>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive updates about new shows and features.</p>
              </div>
              <Switch checked={settings.notifications} onCheckedChange={handleToggle("notifications")} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
