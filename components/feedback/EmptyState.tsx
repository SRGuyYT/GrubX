import { FolderOpenDot } from "lucide-react";

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="liquid-glass-soft flex min-h-[220px] flex-col items-center justify-center rounded-[1.75rem] px-6 py-12 text-center">
      <FolderOpenDot className="mb-4 size-10 text-[var(--accent)]" />
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-[var(--muted)]">{description}</p>
    </div>
  );
}
