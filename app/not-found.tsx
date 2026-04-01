import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page-shell flex min-h-[70vh] items-center justify-center py-16">
      <div className="liquid-glass max-w-2xl rounded-[2rem] px-8 py-10 text-center">
        <p className="text-xs uppercase tracking-[0.32em] text-[var(--muted)]">Not found</p>
        <h1 className="mt-3 text-4xl font-semibold">This route does not exist in GrubX.</h1>
        <p className="mt-4 text-sm text-[var(--muted)]">
          The App Router migration could not find the requested title or page.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-black transition hover:brightness-110"
        >
          Return home
        </Link>
      </div>
    </div>
  );
}
