"use client";

import { useEffect } from "react";
import { trackClick } from "@/lib/track";

export default function TrackOpen({ id }: { id: number }) {
  useEffect(() => {
    trackClick(id, "open");
  }, [id]);
  return null;
}
