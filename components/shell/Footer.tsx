export function Footer() {
  return (
    <footer className="page-shell pb-12 pt-16 text-sm text-[var(--muted)]">
      <div className="liquid-glass-soft flex flex-col gap-4 rounded-[2rem] px-6 py-6 md:flex-row md:items-center md:justify-between">
        <p>GrubX keeps guest data local and account data inside Firebase only.</p>
        <p>TMDB content is fetched through your configured proxy and rendered with App Router.</p>
      </div>
    </footer>
  );
}
