import { LoaderCircle } from "lucide-react";

export function LoadingState({
  title = "Loading",
  description = "Building the next frame.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="liquid-glass mx-auto flex min-h-[260px] w-full max-w-3xl flex-col items-center justify-center rounded-[2rem] px-6 py-16 text-center">
      <LoaderCircle className="mb-4 size-10 animate-spin text-[var(--accent)]" />
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-[var(--muted)]">{description}</p>
    </div>
  );
}
