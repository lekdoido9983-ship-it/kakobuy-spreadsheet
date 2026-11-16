"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  defaultValue?: string;
  placeholder?: string;
  onSearch?: (q: string) => void;
  size?: "sm" | "lg";
}

export default function SearchBar({
  defaultValue = "",
  placeholder = "Search products…",
  onSearch,
  size = "sm",
}: Props) {
  const [q, setQ] = useState(defaultValue);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(q);
    } else {
      router.push(`/products?q=${encodeURIComponent(q)}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <svg className="w-4 h-4" style={{ color: "var(--text-muted)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="search"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          if (onSearch) onSearch(e.target.value);
        }}
        placeholder={placeholder}
        className={`search-input w-full pl-9 pr-4 rounded-xl font-medium ${size === "lg" ? "py-4 text-base" : "py-2.5 text-sm"}`}
      />
    </form>
  );
}
