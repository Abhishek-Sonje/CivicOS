"use client";

import { useState } from "react";

export default function ArchitectureExplainer() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-xl border border-[oklch(28%_0.02_265)] bg-[oklch(16%_0.012_265)] overflow-hidden transition-all">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between hover:bg-[oklch(18%_0.015_265)] transition-colors text-left cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[oklch(72%_0.19_145/0.12)] border border-[oklch(72%_0.19_145/0.3)] flex items-center justify-center">
            <svg className="w-4 h-4 text-[oklch(72%_0.19_145)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[oklch(94%_0.005_265)]">Architecture & Self-Healing Engine</h3>
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-[oklch(72%_0.19_145/0.15)] text-[oklch(72%_0.19_145)] border border-[oklch(72%_0.19_145/0.3)]">
                Bright Data Inside
              </span>
            </div>
            <p className="text-[11px] text-[oklch(60%_0.01_265)] mt-0.5">
              Click to view how data flows from scrapers to AI classification and map rendering
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[oklch(42%_0.01_265)]">{isOpen ? "Hide Specs" : "View Specs"}</span>
          <svg
            className={`w-4 h-4 text-[oklch(60%_0.01_265)] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="p-5 border-t border-[oklch(22%_0.015_265)] grid grid-cols-1 md:grid-cols-4 gap-4 bg-[oklch(14%_0.01_265/0.5)]">
          <ArchStep
            step="01"
            title="Ingestion & Scraping"
            badge="Bright Data"
            badgeColor="blue"
            description="11 Scraper Studio collectors continuously poll news RSS feeds, MyPunePulse listings, Reddit r/pune, and civic portals."
          />
          <ArchStep
            step="02"
            title="Self-Healing Engine"
            badge="Resilience"
            badgeColor="amber"
            description="Automatic retries with exponential backoff, selector fallback chains, and run-status logging prevent downtime when source sites change."
          />
          <ArchStep
            step="03"
            title="AI Classification"
            badge="Gemini 1.5 Flash"
            badgeColor="purple"
            description="Extracts civic category (Pothole/Garbage/Waterlogging/Light), severity (1-5), location text, and Pune neighborhood name."
          />
          <ArchStep
            step="04"
            title="Geocoding & Map"
            badge="Leaflet + Nominatim"
            badgeColor="green"
            description="Converts extracted area names into precise lat/lon coordinates, rendering animated pulse pins and heatmaps on dark CartoDB tiles."
          />
        </div>
      )}
    </div>
  );
}

function ArchStep({
  step,
  title,
  badge,
  badgeColor,
  description,
}: {
  step: string;
  title: string;
  badge: string;
  badgeColor: string;
  description: string;
}) {
  const badgeColors: Record<string, { bg: string; text: string; border: string }> = {
    blue: { bg: "oklch(67%_0.18_240/0.12)", text: "oklch(67%_0.18_240)", border: "oklch(67%_0.18_240/0.3)" },
    amber: { bg: "oklch(78%_0.17_75/0.12)", text: "oklch(78%_0.17_75)", border: "oklch(78%_0.17_75/0.3)" },
    purple: { bg: "oklch(67%_0.18_300/0.12)", text: "oklch(67%_0.18_300)", border: "oklch(67%_0.18_300/0.3)" },
    green: { bg: "oklch(72%_0.19_145/0.12)", text: "oklch(72%_0.19_145)", border: "oklch(72%_0.19_145/0.3)" },
  };
  const b = badgeColors[badgeColor] || badgeColors.blue;

  return (
    <div className="p-3.5 rounded-lg border border-[oklch(24%_0.015_265)] bg-[oklch(18%_0.012_265)] flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono font-black text-[oklch(42%_0.01_265)]">{step}</span>
        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border" style={{ background: b.bg, color: b.text, borderColor: b.border }}>
          {badge}
        </span>
      </div>
      <h4 className="text-xs font-bold text-[oklch(94%_0.005_265)] leading-tight">{title}</h4>
      <p className="text-[11px] text-[oklch(60%_0.01_265)] leading-relaxed">{description}</p>
    </div>
  );
}
