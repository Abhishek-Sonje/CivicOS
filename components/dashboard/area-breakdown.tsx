"use client";

import { useMemo } from "react";
import type { Issue } from "../../lib/types/issue";

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

export default function AreaBreakdown({ issues }: { issues: Issue[] }) {
  const areaStats = useMemo(() => {
    const map: Record<string, { area: string; total: number; maxSeverity: number; categories: Record<string, number> }> = {};
    for (const issue of issues) {
      const area = issue.area || "General Pune";
      if (!map[area]) map[area] = { area, total: 0, maxSeverity: 0, categories: {} };
      map[area].total++;
      map[area].maxSeverity = Math.max(map[area].maxSeverity, issue.severity);
      map[area].categories[issue.category] = (map[area].categories[issue.category] || 0) + 1;
    }
    return Object.values(map).sort((a, b) => b.total - a.total).slice(0, 12);
  }, [issues]);

  const maxTotal = Math.max(...areaStats.map((s) => s.total), 1);

  return (
    <div
      className="rounded-xl border border-[oklch(28%_0.02_265)] flex flex-col overflow-hidden"
      style={{ background: "oklch(18%_0.01_265)", height: "580px" }}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-[oklch(22%_0.015_265)] flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 rounded-full bg-[oklch(72%_0.19_145)]"></div>
            <h2 className="text-sm font-bold text-[oklch(94%_0.005_265)]">Area Breakdown</h2>
          </div>
          <p className="text-[10px] text-[oklch(42%_0.01_265)] ml-3 mt-0.5">{areaStats.length} Pune neighborhoods</p>
        </div>
        <span className="text-xs font-black text-[oklch(72%_0.19_145)]">{issues.length}</span>
      </div>

      {/* Area list */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {areaStats.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-xs text-[oklch(42%_0.01_265)]">
            No issues visible
          </div>
        ) : (
          areaStats.map(({ area, total, maxSeverity, categories }) => {
            const barWidth = (total / maxTotal) * 100;
            const severityColor = maxSeverity >= 4 ? "oklch(63%_0.22_25)" : maxSeverity >= 3 ? "oklch(78%_0.17_75)" : "oklch(72%_0.19_145)";

            return (
              <div
                key={area}
                className="p-3 rounded-lg border border-[oklch(24%_0.015_265)] hover:border-[oklch(32%_0.02_265)] transition-all duration-200"
                style={{ background: "oklch(20%_0.012_265)" }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[oklch(94%_0.005_265)]">{area}</span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="text-[9px] font-mono px-1.5 py-0.5 rounded"
                      style={{ background: `${severityColor.replace(")", "/0.15)")}`, color: severityColor }}
                    >
                      sev {maxSeverity}
                    </span>
                    <span className="text-xs font-black" style={{ color: severityColor }}>{total}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 rounded-full bg-[oklch(24%_0.015_265)] overflow-hidden mb-2">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${barWidth}%`, background: `linear-gradient(90deg, ${severityColor}, ${severityColor.replace(")", "/0.7)")})` }}
                  />
                </div>

                {/* Category pills */}
                <div className="flex flex-wrap gap-1">
                  {Object.entries(categories).map(([cat, count]) => (
                    <span
                      key={cat}
                      className="text-[8px] font-bold px-1.5 py-0.5 rounded border"
                      style={{
                        background: `${CATEGORY_COLORS[cat]?.replace(")", "/0.12)")}`,
                        color: CATEGORY_COLORS[cat] ?? "oklch(60%_0.01_265)",
                        borderColor: `${CATEGORY_COLORS[cat]?.replace(")", "/0.3)")}`,
                      }}
                    >
                      {CATEGORY_ICONS[cat]} {count}
                    </span>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
