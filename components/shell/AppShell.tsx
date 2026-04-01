import type { ReactNode } from "react";

import { GuestModeBanner } from "@/components/user/GuestModeBanner";
import { Footer } from "@/components/shell/Footer";
import { Navbar } from "@/components/shell/Navbar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="grain min-h-screen">
      <Navbar />
      <GuestModeBanner />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
