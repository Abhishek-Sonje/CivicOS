"use client";

import type { Issue } from "../../lib/types/issue";

const CATEGORY_ICONS: Record<string, string> = {
  "Pothole/Road Damage": "🕳️",
  "Garbage/Trash Overflow": "🗑️",
  "Waterlogging/Drainage": "💧",
  "Streetlight Failure": "💡",
};

export default function LiveFeedTicker({ issues }: { issues: Issue[] }) {
  const recent = [...issues]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 8);

  if (recent.length === 0) return null;

  // Duplicate list for seamless infinite horizontal scroll
  const items = [...recent, ...recent];

  return (
    <div className="border-y border-[oklch(22%_0.015_265)] bg-[oklch(14%_0.01_265)] py-2.5 overflow-hidden select-none">
      <div className="ticker-track flex gap-8 whitespace-nowrap" style={{ width: "max-content" }}>
        {items.map((issue, i) => (
          <span key={`${issue.id}-${i}`} className="flex items-center gap-2 text-[11px] font-mono text-[oklch(60%_0.01_265)]">
            <span className="text-xs">{CATEGORY_ICONS[issue.category] ?? "📋"}</span>
            <span className="text-[oklch(72%_0.19_145)] font-bold">{issue.area ?? "Pune"}</span>
            <span className="text-[oklch(36%_0.02_265)]">·</span>
            <span className="text-[oklch(94%_0.005_265)] font-medium max-w-[260px] truncate">{issue.post_title}</span>
            <span className="text-[oklch(36%_0.02_265)]">·</span>
            <span className="text-[9px] font-mono uppercase text-[oklch(42%_0.01_265)] px-1.5 py-0.5 rounded bg-[oklch(18%_0.01_265)] border border-[oklch(28%_0.02_265)]">
              Sev {issue.severity}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
