import { Product } from "@/lib/products";
import ProductCard from "./ProductCard";

interface Props {
  products: Product[];
  emptyMessage?: string;
}

export default function ProductGrid({ products, emptyMessage = "No products found." }: Props) {
  if (!products.length) {
    return (
      <div className="text-center py-24" style={{ color: "var(--text-muted)" }}>
        <p style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔍</p>
        <p className="font-semibold text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
