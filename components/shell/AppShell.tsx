import type { ReactNode } from "react";

import { Footer } from "@/components/shell/Footer";
import { Navbar } from "@/components/shell/Navbar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="grain min-h-screen overflow-x-hidden">
      <Navbar />
      <div className="pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-[calc(4.75rem+env(safe-area-inset-top))] md:pb-12 md:pt-[calc(5.5rem+env(safe-area-inset-top))]">
        <div className="page-shell pb-3 sm:hidden">
          <div className="rounded-[1rem] border border-white/10 bg-black/58 px-4 py-3 text-center text-xs font-semibold leading-5 text-white/88 backdrop-blur-xl">
            GrubX is not fully compatible with phones. Please move to a bigger screen if possible.
          </div>
        </div>
        <main>{children}</main>
        <Footer />
      </div>
    </div>
  );
}
