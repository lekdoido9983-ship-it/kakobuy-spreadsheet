import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CATEGORIES } from "@/lib/categories";
import CategoryView from "@/components/CategoryView";

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

export default async function CategoryPage({ params }: PageProps<"/category/[category]">) {
  const { category } = await params;
  const catName = CATEGORIES.find((c) => c.toLowerCase() === category.toLowerCase());
  if (!catName) notFound();
  return <CategoryView catName={catName} page={1} />;
}
