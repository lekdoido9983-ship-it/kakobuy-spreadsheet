"use client";

import Link from "next/link";
import { CATEGORIES, CATEGORY_ICONS } from "@/lib/products";

interface Props {
  activeCategory?: string;
  onSelect?: (cat: string) => void;
  selected?: string;
}

export default function CategoryNav({ activeCategory, onSelect, selected }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
      {/* All pill */}
      {onSelect ? (
        <button
          onClick={() => onSelect("")}
          className={`category-pill ${!selected ? "active" : ""}`}
        >
          All
        </button>
      ) : (
        <Link href="/products" className={`category-pill ${!activeCategory ? "active" : ""}`}>
          All
        </Link>
      )}

      {CATEGORIES.map((cat) => {
        const icon = CATEGORY_ICONS[cat];
        const isActive = onSelect
          ? selected?.toLowerCase() === cat.toLowerCase()
          : activeCategory?.toLowerCase() === cat.toLowerCase();

        return onSelect ? (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            className={`category-pill flex items-center gap-1.5 ${isActive ? "active" : ""}`}
          >
            <span>{icon}</span>
            {cat}
          </button>
        ) : (
          <Link
            key={cat}
            href={`/category/${cat.toLowerCase()}`}
            className={`category-pill flex items-center gap-1.5 ${isActive ? "active" : ""}`}
          >
            <span>{icon}</span>
            {cat}
          </Link>
        );
      })}
    </div>
  );
}
