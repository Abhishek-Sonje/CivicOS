"use client";

import { useState, useMemo } from "react";
import DashboardMap from "../map/dashboard-map";
import AreaBreakdown from "./area-breakdown";
import type { Issue, SourceType } from "../../lib/types/issue";
import { MAP_RELEVANCE_THRESHOLD } from "../../lib/types/issue";

interface DashboardLayoutProps {
  issues: Issue[];
  defaultCenter: [number, number];
  defaultZoom: number;
}

const CATEGORIES = [
  "Pothole/Road Damage",
  "Garbage/Trash Overflow",
  "Waterlogging/Drainage",
  "Streetlight Failure",
];

const SOURCE_LABELS: Record<SourceType, string> = {
  citizen_platform: "Citizen Portal",
  news_letter: "News Column",
  social: "Social Media",
  mock: "Mock Data",
};

export default function DashboardLayout({
  issues,
  defaultCenter,
  defaultZoom,
}: DashboardLayoutProps) {
  // 1. Filter States
  const [relevanceThreshold, setRelevanceThreshold] = useState(MAP_RELEVANCE_THRESHOLD);
  const [selectedSources, setSelectedSources] = useState<Set<SourceType>>(
    new Set(["citizen_platform", "news_letter", "social", "mock"])
  );
  // Default to all categories selected
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set(CATEGORIES)
  );
  const [searchQuery, setSearchQuery] = useState("");

  // 2. Toggle Source Selection helper
  const toggleSource = (source: SourceType) => {
    const updated = new Set(selectedSources);
    if (updated.has(source)) {
      updated.delete(source);
    } else {
      updated.add(source);
    }
    setSelectedSources(updated);
  };

  // 3. Toggle Category Selection helper
  const toggleCategory = (category: string) => {
    const updated = new Set(selectedCategories);
    if (updated.has(category)) {
      // Don't deselect the last category (keep at least one visible)
      if (updated.size > 1) {
        updated.delete(category);
      }
    } else {
      updated.add(category);
    }
    setSelectedCategories(updated);
  };

  // 4. Compute Filtered Issues dataset reactively
  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      // Relevance filter
      if (issue.relevance_score < relevanceThreshold) {
        return false;
      }

      // Source type filter
      if (!selectedSources.has(issue.source_type)) {
        return false;
      }

      // Category filter (multi-select check)
      if (!selectedCategories.has(issue.category)) {
        return false;
      }

      // Text search query filter (title or description)
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchesTitle = issue.post_title?.toLowerCase().includes(q);
        const matchesDesc = issue.description_text?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc) {
          return false;
        }
      }

      return true;
    });
  }, [issues, relevanceThreshold, selectedSources, selectedCategories, searchQuery]);

  // 5. Compute Metrics stats deck
  const stats = useMemo(() => {
    const total = filteredIssues.length;
    const geocodeFailed = filteredIssues.filter((i) => i.geocode_status === "failed").length;

    const avgSeverity =
      total > 0
        ? parseFloat(
            (filteredIssues.reduce((sum, i) => sum + i.severity, 0) / total).toFixed(1)
          )
        : 0;

    return { total, avgSeverity, geocodeFailed };
  }, [filteredIssues]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start animate-fade-in">
      {/* Sidebar Controls Card */}
      <div className="bg-surface border border-border p-5 rounded-panel shadow-sm flex flex-col gap-5">
        <div className="border-b border-border pb-3">
          <h2 className="text-sm font-bold text-foreground">Interactive Filters</h2>
          <p className="text-[10px] text-foreground/60 mt-0.5">
            Refine issues on the map in real-time.
          </p>
        </div>

        {/* Relevance Score Slider */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-foreground/80">Relevance Score</span>
            <span className="font-bold text-primary font-mono">
              &ge; {relevanceThreshold.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={relevanceThreshold}
            onChange={(e) => setRelevanceThreshold(parseFloat(e.target.value))}
            className="w-full h-1 bg-surface-muted rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-[9px] text-foreground/50 font-mono">
            <span>0.00 (all)</span>
            <span>0.70 (standard)</span>
            <span>1.00 (strict)</span>
          </div>
        </div>

        {/* Source Type Filter Checkboxes */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-foreground/80">Data Sources</span>
          <div className="flex flex-col gap-2 mt-1">
            {(Object.keys(SOURCE_LABELS) as SourceType[]).map((src) => {
              const count = issues.filter((i) => i.source_type === src).length;
              return (
                <label
                  key={src}
                  className="flex items-center justify-between text-xs text-foreground/85 cursor-pointer hover:text-foreground transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedSources.has(src)}
                      onChange={() => toggleSource(src)}
                      className="rounded border-border text-primary focus:ring-primary w-3.5 h-3.5 cursor-pointer"
                    />
                    <span>{SOURCE_LABELS[src]}</span>
                  </div>
                  <span className="text-[10px] font-mono text-foreground/50 group-hover:text-foreground/75 transition-colors">
                    ({count})
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Text Keyword Search */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="keyword-search" className="text-xs font-semibold text-foreground/80">
            Keyword Search
          </label>
          <div className="relative">
            <input
              id="keyword-search"
              type="text"
              placeholder="Search title, details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-surface border border-border text-foreground text-xs rounded-panel p-2 pr-8 w-full outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground/75 text-xs font-bold cursor-pointer"
              >
                &times;
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Stats, Map and Area Breakdowns Deck */}
      <div className="lg:col-span-3 flex flex-col gap-6">
        {/* Metric cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-surface border border-border p-4 rounded-panel shadow-sm flex flex-col gap-1">
            <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-wide">
              Visible Issues
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-extrabold text-foreground">{stats.total}</span>
              <span className="text-xs text-foreground/45">matching filters</span>
            </div>
          </div>

          <div className="bg-surface border border-border p-4 rounded-panel shadow-sm flex flex-col gap-1">
            <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-wide">
              Avg Severity
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-extrabold text-foreground">
                {stats.total > 0 ? stats.avgSeverity : "—"}
              </span>
              <span className="text-xs text-foreground/45">out of 5</span>
            </div>
          </div>

          <div className="bg-surface border border-border p-4 rounded-panel shadow-sm flex flex-col gap-1">
            <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-wide">
              Location Pending
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span
                className={`text-2xl font-extrabold ${
                  stats.geocodeFailed > 0 ? "text-severity-critical" : "text-foreground"
                }`}
              >
                {stats.geocodeFailed}
              </span>
              <span className="text-xs text-foreground/45">need manual lat/lon</span>
            </div>
          </div>
        </div>

        {/* Map and Area Breakdown split layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
          <div className="xl:col-span-2">
            <DashboardMap
              issues={filteredIssues}
              defaultCenter={defaultCenter}
              defaultZoom={defaultZoom}
              selectedCategories={selectedCategories}
              toggleCategory={toggleCategory}
            />
          </div>
          <div className="xl:col-span-1">
            <AreaBreakdown issues={filteredIssues} />
          </div>
        </div>
      </div>
    </div>
  );
}
