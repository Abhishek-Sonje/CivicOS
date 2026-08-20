"use client";

import type { Issue } from "../../lib/types/issue";

interface IssueDetailPanelProps {
  issue: Issue;
  onClose: () => void;
}

const CATEGORY_CONFIG: Record<string, { color: string; bg: string; border: string; icon: string }> = {
  "Pothole/Road Damage": { color: "oklch(63%_0.22_25)", bg: "oklch(63%_0.22_25/0.12)", border: "oklch(63%_0.22_25/0.3)", icon: "🕳️" },
  "Garbage/Trash Overflow": { color: "oklch(78%_0.17_75)", bg: "oklch(78%_0.17_75/0.12)", border: "oklch(78%_0.17_75/0.3)", icon: "🗑️" },
  "Waterlogging/Drainage": { color: "oklch(67%_0.18_240)", bg: "oklch(67%_0.18_240/0.12)", border: "oklch(67%_0.18_240/0.3)", icon: "💧" },
  "Streetlight Failure": { color: "oklch(67%_0.18_300)", bg: "oklch(67%_0.18_300/0.12)", border: "oklch(67%_0.18_300/0.3)", icon: "💡" },
};

const SOURCE_LABELS: Record<string, string> = {
  citizen_platform: "Citizen Portal",
  news_letter: "News Article",
  social: "Social Media",
  mock: "Demo Data",
};

export default function IssueDetailPanel({ issue, onClose }: IssueDetailPanelProps) {
  const cat = CATEGORY_CONFIG[issue.category] ?? { color: "oklch(72%_0.19_145)", bg: "oklch(72%_0.19_145/0.1)", border: "oklch(72%_0.19_145/0.3)", icon: "📋" };

  const timeAgo = (ts: string) => {
    try {
      const ms = Date.now() - new Date(ts).getTime();
      const days = Math.floor(ms / 86400000);
      if (days === 0) return "Today";
      if (days === 1) return "Yesterday";
      return `${days} days ago`;
    } catch { return "Recently"; }
  };

  const severityStars = Array.from({ length: 5 }, (_, i) => i < issue.severity);

  return (
    <div className="absolute inset-0 z-[2000] flex items-stretch justify-end pointer-events-none">
      {/* Backdrop */}
      <div
        className="absolute inset-0 pointer-events-auto"
        style={{ background: "oklch(0%_0_0/0.4)", backdropFilter: "blur(2px)" }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="relative pointer-events-auto w-80 max-w-full flex flex-col overflow-y-auto"
        style={{
          background: "oklch(16%_0.012_265)",
          borderLeft: "1px solid oklch(28%_0.02_265)",
          animation: "slide-in-right 0.25s ease-out both",
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-[oklch(22%_0.015_265)]">
          <div className="flex items-center gap-2">
            <span className="text-lg">{cat.icon}</span>
            <div>
              <span
                className="inline-block text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider"
                style={{ background: cat.bg, color: cat.color, border: `1px solid ${cat.border}` }}
              >
                {issue.category.split("/")[0]}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg border border-[oklch(28%_0.02_265)] flex items-center justify-center text-[oklch(60%_0.01_265)] hover:text-[oklch(94%_0.005_265)] hover:border-[oklch(36%_0.02_265)] transition-all cursor-pointer text-sm"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col gap-4">
          {/* Title */}
          <h3 className="text-sm font-bold text-[oklch(94%_0.005_265)] leading-snug">
            {issue.post_title}
          </h3>

          {/* Meta row */}
          <div className="flex flex-wrap gap-2">
            {issue.area && (
              <span className="flex items-center gap-1 text-[10px] text-[oklch(60%_0.01_265)]">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                </svg>
                {issue.area}, Pune
              </span>
            )}
            <span className="text-[10px] text-[oklch(60%_0.01_265)]">· {timeAgo(issue.timestamp)}</span>
            <span className="text-[10px] text-[oklch(60%_0.01_265)]">· {SOURCE_LABELS[issue.source_type] ?? issue.source_type}</span>
          </div>

          {/* Severity */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[oklch(42%_0.01_265)]">Severity</span>
            <div className="flex items-center gap-1.5">
              {severityStars.map((filled, i) => (
                <div
                  key={i}
                  className="w-5 h-5 rounded-sm"
                  style={{
                    background: filled
                      ? issue.severity >= 4 ? "oklch(63%_0.22_25)" : issue.severity >= 3 ? "oklch(78%_0.17_75)" : "oklch(72%_0.19_145)"
                      : "oklch(22%_0.015_265)",
                  }}
                />
              ))}
              <span className="text-xs font-bold ml-1" style={{ color: issue.severity >= 4 ? "oklch(63%_0.22_25)" : issue.severity >= 3 ? "oklch(78%_0.17_75)" : "oklch(72%_0.19_145)" }}>
                {issue.severity}/5
              </span>
            </div>
          </div>

          {/* Description */}
          {issue.description_text && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[oklch(42%_0.01_265)]">Details</span>
              <p className="text-[11px] text-[oklch(60%_0.01_265)] leading-relaxed line-clamp-6">
                {issue.description_text}
              </p>
            </div>
          )}

          {/* Source link */}
          {issue.source_url && !issue.source_url.startsWith("http://mock") && (
            <a
              href={issue.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-lg border border-[oklch(28%_0.02_265)] hover:border-[oklch(72%_0.19_145/0.5)] transition-colors group"
            >
              <span className="text-[11px] font-semibold text-[oklch(72%_0.19_145)] group-hover:text-[oklch(80%_0.19_145)] truncate pr-2">
                View Original Source
              </span>
              <svg className="w-3.5 h-3.5 text-[oklch(72%_0.19_145)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </a>
          )}

          {/* Coordinates */}
          {issue.lat && issue.lon && (
            <div className="text-[9px] font-mono text-[oklch(36%_0.02_265)] border-t border-[oklch(22%_0.015_265)] pt-3">
              📌 {issue.lat.toFixed(4)}, {issue.lon.toFixed(4)} · Geocoded
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
