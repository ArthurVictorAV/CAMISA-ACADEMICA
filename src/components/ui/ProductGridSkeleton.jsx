export default function ProductGridSkeleton({ quantidade = 8 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: quantidade }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col overflow-hidden rounded-2xl border border-amber-400/10 bg-slate-900"
        >
          <div className="aspect-[4/5] w-full animate-pulse bg-slate-800" />

          <div className="flex flex-col gap-3 p-4">
            <div className="h-4 w-3/4 animate-pulse rounded bg-slate-800" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-slate-800" />

            <div className="flex gap-1.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-8 w-8 animate-pulse rounded-md bg-slate-800"
                />
              ))}
            </div>

            <div className="mt-auto h-10 w-full animate-pulse rounded-lg bg-slate-800" />
          </div>
        </div>
      ))}
    </div>
  );
}
