const statusCodes = [
  ["200 OK", "request successful"],
  ["301 Moved Permanently", "update links"],
  ["302 Temporary Redirect", "temporary move"],
  ["304 Not Modified", "cached version"],
  ["404 Not Found", "page missing"],
  ["500 Server Error", "backend issue"],
  ["502 Bad Gateway", "server config issue"],
  ["503 Service Unavailable", "try later"],
  ["504 Gateway Timeout", "server timeout"],
] as const;

export function ErrorOverviewPanel({
  route,
  stack,
}: {
  route: string;
  stack?: string;
}) {
  return (
    <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.035] p-5">
      <h2 className="text-2xl font-bold text-white">ERROR OVERVIEW PANEL</h2>
      <p className="mt-3 text-sm text-[var(--muted)]">Route: {route}</p>
      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        {statusCodes.map(([code, meaning]) => (
          <div key={code} className="rounded-[0.9rem] border border-white/8 bg-black/24 px-4 py-3 text-sm">
            <span className="font-semibold text-white">{code}</span>
            <span className="text-[var(--muted)]"> {"->"} {meaning}</span>
          </div>
        ))}
      </div>
      {stack ? (
        <pre className="mt-5 max-h-[320px] overflow-auto rounded-[0.9rem] border border-white/8 bg-black/42 p-4 text-xs leading-5 text-red-100">
          {stack}
        </pre>
      ) : null}
    </div>
  );
}
