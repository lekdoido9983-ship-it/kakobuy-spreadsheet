import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { CATEGORIES } from "@/lib/categories";
import { Suspense } from "react";
import CategoryView, { categoryPageCount } from "@/components/CategoryView";
import { CategorySkeleton } from "@/components/Skeletons";

export function generateStaticParams() {
  return CATEGORIES.flatMap((cat) =>
    Array.from({ length: Math.max(0, categoryPageCount(cat) - 1) }, (_, i) => ({
      category: cat.toLowerCase(),
      page: String(i + 2),
    }))
  );
}

export async function generateMetadata({ params }: PageProps<"/category/[category]/page/[page]">): Promise<Metadata> {
  const { category, page } = await params;
  const name = CATEGORIES.find((c) => c.toLowerCase() === category.toLowerCase());
  if (!name) return {};
  return {
    title: `${name} finds - page ${page}`,
    description: `Browse ${name.toLowerCase()} on RepsTitan, page ${page}.`,
    alternates: { canonical: `/category/${name.toLowerCase()}/page/${page}` },
  };
}

export default function CategoryPagedPage({ params }: PageProps<"/category/[category]/page/[page]">) {
  return (
    <Suspense fallback={<CategorySkeleton />}>
      <CategoryPagedContent params={params} />
    </Suspense>
  );
}

async function CategoryPagedContent({ params }: Pick<PageProps<"/category/[category]/page/[page]">, "params">) {
  const { category, page } = await params;
  const catName = CATEGORIES.find((c) => c.toLowerCase() === category.toLowerCase());
  const n = Number(page);
  if (!catName || !Number.isInteger(n) || n < 1 || n > categoryPageCount(catName)) notFound();
  if (n === 1) redirect(`/category/${catName.toLowerCase()}`);
  return <CategoryView catName={catName} page={n} />;
}
