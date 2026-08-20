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
  defaultCenter: [number, number];
  defaultZoom: number;
  selectedCategories: Set<string>;
  toggleCategory: (category: string) => void;
}

/**
 * A Client Component wrapper for the Leaflet map that embeds floating category filter toggles in the viewport.
 */
export default function DashboardMap({
  issues,
  defaultCenter,
  defaultZoom,
  selectedCategories,
  toggleCategory,
}: DashboardMapProps) {
  const CATEGORIES = [
    "Pothole/Road Damage",
    "Garbage/Trash Overflow",
    "Waterlogging/Drainage",
    "Streetlight Failure",
  ];

  return (
    <div className="relative w-full h-[600px] rounded-panel overflow-hidden border border-border shadow-sm">
      <DynamicMap issues={issues} defaultCenter={defaultCenter} defaultZoom={defaultZoom} />

      {/* Floating Viewport Category Legend Overlay */}
      <div className="absolute top-4 right-4 z-[1000] bg-surface/90 backdrop-blur-md border border-border p-3.5 rounded-panel shadow-md flex flex-col gap-2 max-w-[210px]">
        <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider border-b border-border pb-1.5 mb-0.5">
          Map Categories
        </span>
        <div className="flex flex-col gap-2">
          {CATEGORIES.map((cat) => {
            let accentColor = "";
            if (cat === "Pothole/Road Damage") {
              accentColor = "accent-red-500";
            } else if (cat === "Garbage/Trash Overflow") {
              accentColor = "accent-amber-500";
            } else if (cat === "Waterlogging/Drainage") {
              accentColor = "accent-blue-500";
            } else {
              accentColor = "accent-purple-500";
            }

            return (
              <label
                key={cat}
                className="flex items-center gap-2.5 text-[11px] font-medium text-foreground/80 hover:text-foreground cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.has(cat)}
                  onChange={() => toggleCategory(cat)}
                  className={`rounded border-border w-3.5 h-3.5 cursor-pointer ${accentColor}`}
                />
                <span>{cat.split("/")[0]}</span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
