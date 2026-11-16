import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-28 text-center">
      <p className="eyebrow justify-center mb-4">Error 404</p>
      <h1 className="section-title text-5xl mb-4">
        Lost in the <em>kingdom.</em>
      </h1>
      <p className="mb-8" style={{ color: "var(--text-muted)" }}>
        That page doesn&apos;t exist, or the find was removed.
      </p>
      <Link href="/products" className="btn-primary px-8 py-4">
        Browse all finds →
      </Link>
    </div>
  );
}
