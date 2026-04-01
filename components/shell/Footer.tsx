export function Footer() {
  return (
    <footer className="page-shell pb-10 pt-14 text-sm text-[var(--muted)]">
      <div className="liquid-glass-soft flex flex-col gap-3 rounded-[1.75rem] px-5 py-5 md:flex-row md:items-center md:justify-between">
        <p>GrubX keeps guest data local and account data inside Firebase only.</p>
        <p>TMDB content is fetched through your configured proxy and rendered with App Router.</p>
      </div>
    </footer>
  );
}
