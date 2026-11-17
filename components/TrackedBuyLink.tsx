"use client";

import { trackClick } from "@/lib/track";

export default function TrackedBuyLink({ id, href, className, style, children }: { id: number; href: string; className?: string; style?: React.CSSProperties; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer sponsored nofollow" className={className} style={style} onClick={() => trackClick(id, "buy")}>
      {children}
    </a>
  );
}
