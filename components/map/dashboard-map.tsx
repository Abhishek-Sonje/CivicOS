"use client";

import { useState } from "react";
import nextDynamic from "next/dynamic";
import type { Issue } from "../../lib/types/issue";
import IssueDetailPanel from "./issue-detail-panel";

const DynamicMap = nextDynamic(() => import("./issue-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full rounded-xl border border-[oklch(28%_0.02_265)] flex items-center justify-center bg-[oklch(14%_0.01_265)] shimmer" style={{ minHeight: "500px" }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[oklch(72%_0.19_145)] border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-mono text-[oklch(42%_0.01_265)]">Initializing map...</span>
      </div>
    </div>
  ),
});

interface DashboardMapProps {
  issues: Issue[];
  defaultCenter: [number, number];
  defaultZoom: number;
  selectedCategories: Set<string>;
  toggleCategory: (cat: string) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  "Pothole/Road Damage": "oklch(63%_0.22_25)",
  "Garbage/Trash Overflow": "oklch(78%_0.17_75)",
  "Waterlogging/Drainage": "oklch(67%_0.18_240)",
  "Streetlight Failure": "oklch(67%_0.18_300)",
};

const CATEGORY_ICONS: Record<string, string> = {
  "Pothole/Road Damage": "🕳️",
  "Garbage/Trash Overflow": "🗑️",
  "Waterlogging/Drainage": "💧",
  "Streetlight Failure": "💡",
};

export default function DashboardMap({
  issues, defaultCenter, defaultZoom, selectedCategories, toggleCategory,
}: DashboardMapProps) {
  const [mapMode, setMapMode] = useState<"pin" | "heat">("pin");
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  const geocodedCount = issues.filter((i) => i.lat !== null && i.lon !== null).length;

  return (
    <div className="relative rounded-xl border border-[oklch(28%_0.02_265)] overflow-hidden" style={{ height: "580px" }}>
      {/* Map fills entire card */}
      <DynamicMap
        issues={issues}
        defaultCenter={defaultCenter}
        defaultZoom={defaultZoom}
        mapMode={mapMode}
        onIssueClick={setSelectedIssue}
      />

      {/* ── Floating controls top-right ── */}
      <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2 max-w-[190px]">
        {/* Map mode toggle */}
        <div className="glass rounded-lg p-1 flex gap-0.5">
          {(["pin", "heat"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setMapMode(mode)}
              className="flex-1 py-1.5 px-2 rounded text-[10px] font-bold font-mono uppercase tracking-wider transition-all cursor-pointer"
              style={{
                background: mapMode === mode ? "oklch(72%_0.19_145)" : "transparent",
                color: mapMode === mode ? "oklch(14%_0.01_265)" : "oklch(60%_0.01_265)",
              }}
            >
              {mode === "pin" ? "📍 Pin" : "🔥 Heat"}
            </button>
          ))}
        </div>

        {/* Category filters */}
        <div className="glass rounded-lg p-2.5 flex flex-col gap-1.5">
          <p className="text-[9px] font-mono uppercase tracking-widest text-[oklch(42%_0.01_265)] mb-0.5">Categories</p>
          {Object.entries(CATEGORY_ICONS).map(([cat, icon]) => {
            const active = selectedCategories.has(cat);
            const color = CATEGORY_COLORS[cat];
            return (
              <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                <div
                  className="w-3.5 h-3.5 rounded flex items-center justify-center border transition-all"
                  style={{
                    background: active ? color : "transparent",
                    borderColor: active ? color : "oklch(42%_0.01_265)",
                  }}
                  onClick={() => toggleCategory(cat)}
                >
                  {active && (
                    <svg className="w-2 h-2" fill="none" viewBox="0 0 24 24" stroke="oklch(14%_0.01_265)" strokeWidth={4}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  )}
                </div>
                <span
                  className="text-[10px] font-medium transition-colors"
                  style={{ color: active ? "oklch(94%_0.005_265)" : "oklch(42%_0.01_265)" }}
                >
                  {icon} {cat.split("/")[0]}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* ── Bottom-left status ── */}
      <div className="absolute bottom-3 left-3 z-[1000] glass rounded-lg px-3 py-1.5 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[oklch(72%_0.19_145)] status-dot-healthy"></span>
        <span className="text-[10px] font-mono text-[oklch(60%_0.01_265)]">
          {geocodedCount} of {issues.length} pinned
        </span>
      </div>

      {/* ── Issue detail panel (slide-in) ── */}
      {selectedIssue && (
        <IssueDetailPanel issue={selectedIssue} onClose={() => setSelectedIssue(null)} />
      )}
    </div>
  );
}
