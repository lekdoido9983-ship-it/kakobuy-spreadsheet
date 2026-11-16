const pulse = { background: "linear-gradient(90deg, rgba(255,255,255,0.04), rgba(255,255,255,0.09), rgba(255,255,255,0.04))" } as const;

export function ProductSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8" aria-busy="true">
      <div className="h-4 w-64 rounded mb-8" style={pulse} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-20">
        <div className="rounded-3xl p-3" style={{ background: "rgba(48,31,70,0.6)", border: "1px solid var(--line-soft)" }}>
          <div className="rounded-[20px] aspect-square" style={pulse} />
          <div className="flex gap-2 mt-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-16 h-16 rounded-xl shrink-0" style={pulse} />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="h-6 w-20 rounded-full" style={pulse} />
          <div className="h-10 w-3/4 rounded" style={pulse} />
          <div className="h-12 w-28 rounded" style={pulse} />
          <div className="h-48 rounded-2xl" style={pulse} />
          <div className="h-16 rounded-2xl" style={pulse} />
        </div>
      </div>
    </div>
  );
}

export function CategorySkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10" aria-busy="true">
      <div className="h-4 w-48 rounded mb-6" style={pulse} />
      <div className="h-12 w-60 rounded mb-8" style={pulse} />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="rounded-2xl aspect-[3/4]" style={pulse} />
        ))}
      </div>
    </div>
  );
}
