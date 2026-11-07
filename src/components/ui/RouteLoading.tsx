/** Instant feedback while the next page loads (shown by loading.tsx files). */
export function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-5 p-1" role="status" aria-label="Loading">
      <div className="h-7 w-48 rounded-lg bg-ice-100" />
      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => <div key={i} className="h-24 rounded-2xl bg-ice-50" />)}
      </div>
      <div className="h-64 rounded-2xl bg-ice-50" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}

export function FullScreenLoading({ dark = false }: { dark?: boolean }) {
  return (
    <div className={`grid min-h-dvh place-items-center ${dark ? "bg-ink" : "bg-ice-25"}`} role="status" aria-label="Loading">
      <div className="flex flex-col items-center gap-4">
        <span className={`grid size-12 place-items-center rounded-2xl text-lg font-extrabold ${dark ? "bg-white text-ink" : "bg-ink text-white"}`}>MC</span>
        <span className={`size-6 animate-spin rounded-full border-2 border-t-transparent ${dark ? "border-white/70" : "border-ink/70"}`} />
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
