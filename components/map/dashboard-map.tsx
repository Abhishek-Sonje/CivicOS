"use client";

import nextDynamic from "next/dynamic";
import type { Issue } from "../../lib/types/issue";

// Dynamically load the Leaflet map component only on the client side
const DynamicMap = nextDynamic(() => import("./issue-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] rounded-panel border border-border flex items-center justify-center bg-surface-muted">
      <span className="text-sm font-medium text-foreground/50 animate-pulse">Loading map...</span>
    </div>
  ),
});

interface DashboardMapProps {
  issues: Issue[];
}

/**
 * A Client Component wrapper for the Leaflet map to safely enable ssr: false loading in Next.js 16.
 */
export default function DashboardMap({ issues }: DashboardMapProps) {
  return <DynamicMap issues={issues} />;
}
