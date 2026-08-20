"use client";

import { useMemo } from "react";
import type { Issue } from "../../lib/types/issue";

interface AreaBreakdownProps {
  issues: Issue[];
}

export default function AreaBreakdown({ issues }: AreaBreakdownProps) {
  // Group and rank Pune neighborhoods by issues count
  const areaStats = useMemo(() => {
    const statsMap: Record<
      string,
      { area: string; total: number; categories: Record<string, number> }
    > = {};

    for (const issue of issues) {
      const areaName = issue.area || "General Pune / Other";
      if (!statsMap[areaName]) {
        statsMap[areaName] = {
          area: areaName,
          total: 0,
          categories: {},
        };
      }
      statsMap[areaName].total += 1;
      statsMap[areaName].categories[issue.category] =
        (statsMap[areaName].categories[issue.category] || 0) + 1;
    }

    return Object.values(statsMap).sort((a, b) => b.total - a.total);
  }, [issues]);

  return (
    <div className="bg-surface border border-border p-5 rounded-panel shadow-md flex flex-col gap-4 max-h-[600px] overflow-y-auto">
      <div className="border-b border-border pb-3">
        <h2 className="text-sm font-bold text-foreground">Pune Area Breakdown</h2>
        <p className="text-[10px] text-foreground/60 mt-0.5">
          Civic infrastructure issues grouped by neighborhood.
        </p>
      </div>

      {areaStats.length === 0 ? (
        <p className="text-xs text-foreground/50 text-center py-8">
          No visible issues in this viewport selection.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {areaStats.map(({ area, total, categories }) => (
            <div
              key={area}
              className="flex flex-col gap-1.5 p-3 rounded-panel bg-surface-muted/50 border border-border/30 hover:border-border/60 transition-colors"
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-foreground">{area}</span>
                <span className="text-xs font-extrabold text-primary font-mono">
                  {total} {total === 1 ? "issue" : "issues"}
                </span>
              </div>

              {/* Progress bar visual indicator */}
              <div className="w-full bg-surface-muted h-1 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-1 rounded-full"
                  style={{
                    width: `${Math.min(100, (total / Math.max(...areaStats.map((s) => s.total))) * 100)}%`,
                  }}
                ></div>
              </div>

              {/* Category list pills */}
              <div className="flex flex-wrap gap-1 mt-1">
                {Object.entries(categories).map(([category, count]) => {
                  let pillColor = "";
                  if (category === "Pothole/Road Damage") {
                    pillColor = "bg-red-500/10 text-red-600 border-red-500/20";
                  } else if (category === "Garbage/Trash Overflow") {
                    pillColor = "bg-amber-500/10 text-amber-600 border-amber-500/20";
                  } else if (category === "Waterlogging/Drainage") {
                    pillColor = "bg-blue-500/10 text-blue-600 border-blue-500/20";
                  } else {
                    pillColor = "bg-purple-500/10 text-purple-600 border-purple-500/20";
                  }

                  return (
                    <span
                      key={category}
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${pillColor}`}
                    >
                      {count} {category.split("/")[0]}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
