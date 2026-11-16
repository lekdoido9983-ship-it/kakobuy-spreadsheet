import Link from "next/link";

interface Props {
  page: number;
  totalPages: number;
  hrefFor: (page: number) => string;
}

function pageWindow(page: number, total: number) {
  const pages = new Set([1, total, page - 1, page, page + 1]);
  return [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
}

export default function Pagination({ page, totalPages, hrefFor }: Props) {
  if (totalPages <= 1) return null;
  return (
    <nav className="flex items-center justify-center gap-2 mt-12 flex-wrap" aria-label="Pagination">
      {page > 1 && (
        <Link href={hrefFor(page - 1)} className="btn-secondary px-5 py-3" rel="prev">
          ← Prev
        </Link>
      )}
      {pageWindow(page, totalPages).map((p, i, arr) => (
        <span key={p} className="flex items-center gap-2">
          {i > 0 && arr[i - 1] !== p - 1 && <span style={{ color: "var(--text-dim)" }}>…</span>}
          <Link href={hrefFor(p)} className={`category-pill ${p === page ? "active" : ""}`} aria-current={p === page ? "page" : undefined}>
            {p}
          </Link>
        </span>
      ))}
      {page < totalPages && (
        <Link href={hrefFor(page + 1)} className="btn-secondary px-5 py-3" rel="next">
          Next →
        </Link>
      )}
    </nav>
  );
}
