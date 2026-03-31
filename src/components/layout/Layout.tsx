import { ReactNode, useEffect } from "react";
import { Navbar } from "./Navbar";
import { useSettings } from "@/hooks/useUserData";

export function Layout({ children }: { children: ReactNode }) {
  const { settings } = useSettings();

  useEffect(() => {
    if (settings?.blockPopups) {
      const originalWindowOpen = window.open;
      window.open = function (...args) {
        console.warn("Popup blocked by Grubed X popup blocker", args);
        return null;
      };
      return () => {
        window.open = originalWindowOpen;
      };
    }
  }, [settings?.blockPopups]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans dark">
      <Navbar />
      <main className="flex-1 pt-16">{children}</main>
      <footer className="py-8 text-center text-sm text-muted-foreground border-t border-border/20 mt-12 bg-card/30">
        <p>© {new Date().getFullYear()} Grubed X. All rights reserved.</p>
        <p className="mt-2 text-xs opacity-60">Cinematic Streaming Experience</p>
      </footer>
    </div>
  );
}
