"use client";

import { useState, useMemo } from "react";
import DashboardMap from "../map/dashboard-map";
import AreaBreakdown from "./area-breakdown";
import type { Issue } from "../../lib/types/issue";

interface DashboardLayoutProps {
  issues: Issue[];
  defaultCenter: [number, number];
  defaultZoom: number;
}

const CATEGORIES = [
  { key: "Pothole/Road Damage", label: "Pothole", icon: "🕳️", color: "oklch(63%_0.22_25)" },
  { key: "Garbage/Trash Overflow", label: "Garbage", icon: "🗑️", color: "oklch(78%_0.17_75)" },
  { key: "Waterlogging/Drainage", label: "Water", icon: "💧", color: "oklch(67%_0.18_240)" },
  { key: "Streetlight Failure", label: "Lights", icon: "💡", color: "oklch(67%_0.18_300)" },
];

export default function DashboardLayout({ issues, defaultCenter, defaultZoom }: DashboardLayoutProps) {
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set(CATEGORIES.map((c) => c.key))
  );
  const [searchQuery, setSearchQuery] = useState("");

  const toggleCategory = (category: string) => {
    const updated = new Set(selectedCategories);
    if (updated.has(category)) {
      if (updated.size > 1) updated.delete(category);
    } else {
      updated.add(category);
    }
    setSelectedCategories(updated);
  };

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      if (!selectedCategories.has(issue.category)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!issue.post_title?.toLowerCase().includes(q) && !issue.description_text?.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [issues, selectedCategories, searchQuery]);

  const stats = useMemo(() => {
    const total = filteredIssues.length;
    const avgSeverity = total > 0
      ? parseFloat((filteredIssues.reduce((s, i) => s + i.severity, 0) / total).toFixed(1))
      : 0;
    const criticalCount = filteredIssues.filter((i) => i.severity >= 4).length;
    const categoryCounts: Record<string, number> = {};
    for (const issue of filteredIssues) {
      categoryCounts[issue.category] = (categoryCounts[issue.category] || 0) + 1;
    }
    return { total, avgSeverity, criticalCount, categoryCounts };
  }, [filteredIssues]);

  const healthScore = Math.round(Math.max(0, 100 - (stats.avgSeverity / 5) * 100 - stats.criticalCount * 1.5));

  return (
    <div className="flex flex-col gap-5 animate-fade-up-2">
      {/* ── Metric Cards Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          title="Issues Visible"
          value={stats.total}
          sub="matching filters"
          accent="oklch(72%_0.19_145)"
        />
        <MetricCard
          title="Avg Severity"
          value={stats.total > 0 ? `${stats.avgSeverity}/5` : "—"}
          sub="across all categories"
          accent={stats.avgSeverity >= 4 ? "oklch(63%_0.22_25)" : stats.avgSeverity >= 3 ? "oklch(78%_0.17_75)" : "oklch(72%_0.19_145)"}
        />
        <MetricCard
          title="Critical Issues"
          value={stats.criticalCount}
          sub="severity 4-5"
          accent="oklch(63%_0.22_25)"
        />
        <CityHealthCard score={healthScore} />
      </div>

      {/* ── Category Quick-Filter Tabs ── */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map((cat) => {
          const count = stats.categoryCounts[cat.key] ?? 0;
          const active = selectedCategories.has(cat.key);
          return (
            <button
              key={cat.key}
              onClick={() => toggleCategory(cat.key)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold transition-all duration-200 cursor-pointer"
              style={{
                background: active ? `${cat.color.replace(")", "/0.15)")}` : "oklch(18%_0.01_265)",
                borderColor: active ? `${cat.color.replace(")", "/0.5)")}` : "oklch(28%_0.02_265)",
                color: active ? cat.color : "oklch(60%_0.01_265)",
              }}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
              <span className="text-[10px] font-mono opacity-70">({count})</span>
            </button>
          );
        })}

        {/* Keyword search */}
        <div className="ml-auto flex-1 min-w-[180px] max-w-xs relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[oklch(42%_0.01_265)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            placeholder="Search issues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-8 py-2 text-xs rounded-lg border border-[oklch(28%_0.02_265)] bg-[oklch(18%_0.01_265)] text-[oklch(94%_0.005_265)] placeholder-[oklch(42%_0.01_265)] outline-none focus:border-[oklch(72%_0.19_145/0.6)] transition-colors"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-[oklch(42%_0.01_265)] hover:text-[oklch(60%_0.01_265)] cursor-pointer">
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ── Map + Area Breakdown ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-start">
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
  );
}

function MetricCard({ title, value, sub, accent }: { title: string; value: string | number; sub: string; accent: string }) {
  return (
    <div className="p-4 rounded-xl border border-[oklch(28%_0.02_265)] bg-[oklch(18%_0.01_265)] flex flex-col gap-1 hover:border-[oklch(36%_0.02_265)] transition-colors">
      <span className="text-[10px] font-mono uppercase tracking-widest text-[oklch(42%_0.01_265)]">{title}</span>
      <span className="text-2xl font-black mt-1" style={{ color: accent }}>{value}</span>
      <span className="text-[10px] text-[oklch(42%_0.01_265)]">{sub}</span>
    </div>
  );
}

function CityHealthCard({ score }: { score: number }) {
  const color = score >= 70 ? "oklch(72%_0.19_145)" : score >= 40 ? "oklch(78%_0.17_75)" : "oklch(63%_0.22_25)";
  const label = score >= 70 ? "Good" : score >= 40 ? "Moderate" : "Critical";

  // SVG circle progress
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="p-4 rounded-xl border border-[oklch(28%_0.02_265)] bg-[oklch(18%_0.01_265)] flex items-center gap-3 hover:border-[oklch(36%_0.02_265)] transition-colors">
      <svg width="52" height="52" viewBox="0 0 52 52">
        <circle cx="26" cy="26" r={radius} fill="none" stroke="oklch(28%_0.02_265)" strokeWidth="4" />
        <circle
          cx="26" cy="26" r={radius} fill="none"
          stroke={color} strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 26 26)"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
        <text x="26" y="30" textAnchor="middle" className="text-[10px] font-black" fill={color} style={{ fontSize: "11px", fontWeight: 900 }}>{score}</text>
      </svg>
      <div>
        <span className="text-[10px] font-mono uppercase tracking-widest text-[oklch(42%_0.01_265)]">City Health</span>
        <p className="text-sm font-bold mt-0.5" style={{ color }}>{label}</p>
        <p className="text-[9px] text-[oklch(42%_0.01_265)]">civic index /100</p>
      </div>
    </div>
  );
}
