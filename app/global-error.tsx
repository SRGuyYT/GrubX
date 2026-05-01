"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

import { ErrorOverviewPanel } from "@/components/feedback/ErrorOverviewPanel";
import "@/app/globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GrubX global error boundary]", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main className="page-shell grid min-h-screen place-items-center py-12">
          <section className="w-full max-w-5xl space-y-6">
            <div className="rounded-[1.35rem] border border-red-300/20 bg-red-500/10 p-6">
              <AlertTriangle className="size-10 text-red-100" />
              <h1 className="mt-4 text-4xl font-bold text-white md:text-6xl">GrubX encountered an error</h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-red-100/86">
                Something went wrong while loading this page. See more info below.
              </p>
              <button
                type="button"
                onClick={reset}
                className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-bold text-black"
              >
                <RefreshCw className="size-4" />
                Retry
              </button>
            </div>
            <ErrorOverviewPanel route="global" stack={error.stack ?? error.message} />
          </section>
        </main>
      </body>
    </html>
  );
}
