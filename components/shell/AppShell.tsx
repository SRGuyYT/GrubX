import type { ReactNode } from "react";

import { GuestModeBanner } from "@/components/user/GuestModeBanner";
import { Footer } from "@/components/shell/Footer";
import { Navbar } from "@/components/shell/Navbar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="grain min-h-screen overflow-x-hidden pb-6">
      <Navbar />
      <div className="space-y-5 pt-28 md:space-y-7 md:pt-32">
        <GuestModeBanner />
        <main>{children}</main>
      </div>
      <Footer />
    </div>
  );
}
