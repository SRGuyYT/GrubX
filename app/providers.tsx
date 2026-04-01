"use client";

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

import { SessionProvider } from "@/context/SessionContext";
import { SettingsProvider } from "@/context/SettingsContext";

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <SettingsProvider>
          {children}
          <Toaster richColors closeButton position="top-right" theme="dark" />
        </SettingsProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}
