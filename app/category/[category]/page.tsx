import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CATEGORIES } from "@/lib/categories";
import { Suspense } from "react";
import CategoryView from "@/components/CategoryView";
import { CategorySkeleton } from "@/components/Skeletons";

export function generateStaticParams() {
  return CATEGORIES.map((cat) => ({ category: cat.toLowerCase() }));
}

export async function generateMetadata({ params }: PageProps<"/category/[category]">): Promise<Metadata> {
  const { category } = await params;
  const name = CATEGORIES.find((c) => c.toLowerCase() === category.toLowerCase());
  if (!name) return {};
  return {
    title: `${name} finds`,
    description: `Browse ${name.toLowerCase()} from the Kakobuy spreadsheet, with photos and prices.`,
    alternates: { canonical: `/category/${name.toLowerCase()}` },
  };
}

export default function CategoryPage({ params }: PageProps<"/category/[category]">) {
  return (
    <Suspense fallback={<CategorySkeleton />}>
      <CategoryContent params={params} />
    </Suspense>
  );
}

async function CategoryContent({ params }: Pick<PageProps<"/category/[category]">, "params">) {
  const { category } = await params;
  const catName = CATEGORIES.find((c) => c.toLowerCase() === category.toLowerCase());
  if (!catName) notFound();
  return <CategoryView catName={catName} page={1} />;
}
