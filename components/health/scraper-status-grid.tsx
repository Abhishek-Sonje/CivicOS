"use client";

import { useMemo } from "react";

interface ScraperRun {
  id: string;
  collector_id: string;
  status: "healthy" | "failed" | "healing";
  items_fetched: number;
  last_run: string;
  error_message: string | null;
}

interface ScraperStatusGridProps {
  runs: ScraperRun[];
}

const COLLECTOR_DISPLAY: Record<string, { name: string; source: string; type: "rss" | "listing" | "portal" | "social" }> = {
  c_msytjogw20erpmmgps: { name: "Pune Opinify Portal", source: "opinify.in", type: "portal" },
  c_mt1efh5i1k2bvvc79f: { name: "Reddit r/pune", source: "reddit.com", type: "social" },
  c_mt1gftp52qo35dfh4j: { name: "MyPunePulse — Kharadi", source: "mypunepulse.com", type: "listing" },
  c_mypunepulse_dhanori: { name: "MyPunePulse — Dhanori", source: "mypunepulse.com", type: "listing" },
  c_mypunepulse_warje: { name: "MyPunePulse — Warje", source: "mypunepulse.com", type: "listing" },
  c_mypunepulse_sahakarnagar: { name: "MyPunePulse — Sahakarnagar", source: "mypunepulse.com", type: "listing" },
  c_mypunepulse_waterlogging: { name: "MyPunePulse — Waterlogging", source: "mypunepulse.com", type: "listing" },
  c_rss_pune_potholes: { name: "Google News RSS — Potholes", source: "news.google.com", type: "rss" },
  c_rss_pune_garbage: { name: "Google News RSS — Garbage", source: "news.google.com", type: "rss" },
  c_rss_pune_waterlogging: { name: "Google News RSS — Waterlogging", source: "news.google.com", type: "rss" },
  c_rss_pune_streetlights: { name: "Google News RSS — Streetlights", source: "news.google.com", type: "rss" },
};

const TYPE_ICONS: Record<string, string> = {
  rss: "RSS",
  listing: "WEB",
  portal: "API",
  social: "SOC",
};

export default function ScraperStatusGrid({ runs }: ScraperStatusGridProps) {
  const latestRunsMap = useMemo(() => {
    const map: Record<string, ScraperRun> = {};
    for (const run of runs) {
      if (!map[run.collector_id] || new Date(run.last_run) > new Date(map[run.collector_id].last_run)) {
        map[run.collector_id] = run;
      }
    }
    return map;
  }, [runs]);

  const displayedCollectors: CollectorEntry[] = Object.entries(COLLECTOR_DISPLAY).map(([id, meta]) => ({
    id,
    name: meta.name,
    source: meta.source,
    type: meta.type,
    run: latestRunsMap[id] ?? null,
  }));

  const healthyCount = displayedCollectors.filter((c) => c.run?.status === "healthy").length;
  const healingCount = displayedCollectors.filter((c) => c.run?.status === "healing").length;
  const failedCount = displayedCollectors.filter((c) => c.run?.status === "failed").length;
  const totalItems = displayedCollectors.reduce((sum, c) => sum + (c.run?.items_fetched ?? 0), 0);

  return (
    <section>
      {/* Section header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1 h-5 rounded-full bg-[oklch(72%_0.19_145)]"></div>
            <h2 className="text-base font-bold text-[oklch(94%_0.005_265)] tracking-tight">Self-Healing Scraper Pipeline</h2>
          </div>
          <p className="text-xs text-[oklch(60%_0.01_265)] ml-3 pl-0.5">
            {displayedCollectors.length} Bright Data Scraper Studio collectors — automatically recovering from failures
          </p>
        </div>

        {/* Health summary pills */}
        <div className="flex gap-2 flex-wrap">
          <SummaryPill count={healthyCount} label="Healthy" color="oklch(72%_0.19_145)" bg="oklch(72%_0.19_145/0.1)" border="oklch(72%_0.19_145/0.3)" />
          <SummaryPill count={healingCount} label="Self-Healing" color="oklch(78%_0.17_75)" bg="oklch(78%_0.17_75/0.1)" border="oklch(78%_0.17_75/0.3)" />
          <SummaryPill count={failedCount} label="Failed" color="oklch(63%_0.22_25)" bg="oklch(63%_0.22_25/0.1)" border="oklch(63%_0.22_25/0.3)" />
          <SummaryPill count={totalItems} label="Items Fetched" color="oklch(67%_0.18_240)" bg="oklch(67%_0.18_240/0.1)" border="oklch(67%_0.18_240/0.3)" />
        </div>
      </div>

      {/* Collector cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {displayedCollectors.map((collector) => (
          <CollectorCard key={collector.id} collector={collector} />
        ))}
      </div>

      {/* Self-healing explanation */}
      <div className="mt-4 p-4 rounded-lg border border-[oklch(28%_0.02_265)] bg-[oklch(18%_0.01_265/0.5)] flex gap-3">
        <div className="shrink-0 w-8 h-8 rounded-lg bg-[oklch(67%_0.18_240/0.15)] border border-[oklch(67%_0.18_240/0.3)] flex items-center justify-center">
          <svg className="w-4 h-4 text-[oklch(67%_0.18_240)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        </div>
        <div>
          <p className="text-xs font-semibold text-[oklch(94%_0.005_265)]">How Self-Healing Works</p>
          <p className="text-[11px] text-[oklch(60%_0.01_265)] mt-0.5 leading-relaxed">
            When a scraper fails (CSS selectors change, rate limits hit, or feeds go offline), the pipeline automatically{" "}
            <span className="text-[oklch(78%_0.17_75)]">switches to fallback selectors</span>, applies{" "}
            <span className="text-[oklch(78%_0.17_75)]">exponential backoff</span>, and{" "}
            <span className="text-[oklch(78%_0.17_75)]">reroutes to alternative sources</span> — all without manual intervention.
            Yellow collectors are currently recovering.
          </p>
        </div>
      </div>
    </section>
  );
}

function SummaryPill({ count, label, color, bg, border }: { count: number; label: string; color: string; bg: string; border: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border" style={{ background: bg, borderColor: border }}>
      <span className="text-sm font-bold" style={{ color }}>{count}</span>
      <span className="text-[10px] font-mono text-[oklch(60%_0.01_265)]">{label}</span>
    </div>
  );
}

interface CollectorEntry {
  id: string;
  name: string;
  source: string;
  type: "rss" | "listing" | "portal" | "social";
  run: ScraperRun | null;
}

function CollectorCard({ collector }: { collector: CollectorEntry }) {
  const { name, source, type, run } = collector;
  const status: "healthy" | "healing" | "failed" | "unknown" = run?.status ?? "unknown";

  const statusConfig = {
    healthy: { dot: "status-dot-healthy", text: "Healthy", color: "oklch(72%_0.19_145)", border: "oklch(72%_0.19_145/0.2)" },
    healing: { dot: "status-dot-healing", text: "Self-Healing", color: "oklch(78%_0.17_75)", border: "oklch(78%_0.17_75/0.3)" },
    failed: { dot: "status-dot-failed", text: "Failed", color: "oklch(63%_0.22_25)", border: "oklch(63%_0.22_25/0.2)" },
    unknown: { dot: "bg-[oklch(42%_0.01_265)]", text: "No Data", color: "oklch(42%_0.01_265)", border: "oklch(28%_0.02_265)" },
  }[status];

  const typeConfig = {
    rss: { bg: "oklch(67%_0.18_240/0.15)", text: "oklch(67%_0.18_240)" },
    listing: { bg: "oklch(72%_0.19_145/0.12)", text: "oklch(72%_0.19_145)" },
    portal: { bg: "oklch(67%_0.18_300/0.12)", text: "oklch(67%_0.18_300)" },
    social: { bg: "oklch(78%_0.17_75/0.12)", text: "oklch(78%_0.17_75)" },
  }[type as string] || { bg: "oklch(28%_0.02_265)", text: "oklch(60%_0.01_265)" };

  return (
    <div
      className="relative p-4 rounded-lg border transition-all duration-200 hover:border-[oklch(36%_0.02_265)] flex flex-col gap-3"
      style={{
        background: "oklch(18%_0.01_265)",
        borderColor: status === "healing" ? "oklch(78%_0.17_75/0.35)" : status === "failed" ? "oklch(63%_0.22_25/0.3)" : "oklch(28%_0.02_265)",
        boxShadow: status === "healing" ? "0 0 0 1px oklch(78%_0.17_75/0.15)" : status === "failed" ? "0 0 0 1px oklch(63%_0.22_25/0.1)" : "none",
      }}
    >
      {/* Type badge + status */}
      <div className="flex items-center justify-between">
        <span
          className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded"
          style={{ background: typeConfig.bg, color: typeConfig.text }}
        >
          {TYPE_ICONS[type] || "WEB"}
        </span>
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}></span>
          <span className="text-[9px] font-mono" style={{ color: statusConfig.color }}>{statusConfig.text}</span>
        </div>
      </div>

      {/* Collector name */}
      <div>
        <p className="text-xs font-semibold text-[oklch(94%_0.005_265)] leading-tight">{name}</p>
        <p className="text-[10px] text-[oklch(42%_0.01_265)] mt-0.5 font-mono">{source}</p>
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between pt-2 border-t border-[oklch(22%_0.015_265)]">
        <div>
          <p className="text-lg font-black" style={{ color: (run?.items_fetched ?? 0) > 0 ? "oklch(72%_0.19_145)" : "oklch(42%_0.01_265)" }}>
            {run?.items_fetched ?? 0}
          </p>
          <p className="text-[9px] font-mono text-[oklch(42%_0.01_265)]">items</p>
        </div>
        {run?.last_run && (
          <div className="text-right">
            <p className="text-[9px] text-[oklch(42%_0.01_265)]">{formatRunTime(run.last_run)}</p>
          </div>
        )}
      </div>

      {/* Error message for healing/failed */}
      {run?.error_message && (
        <div
          className="text-[9px] leading-relaxed p-2 rounded"
          style={{
            background: status === "healing" ? "oklch(78%_0.17_75/0.08)" : "oklch(63%_0.22_25/0.08)",
            color: status === "healing" ? "oklch(78%_0.17_75)" : "oklch(63%_0.22_25)",
          }}
        >
          ↺ {run.error_message}
        </div>
      )}
    </div>
  );
}

function formatRunTime(dateStr: string): string {
  try {
    const ms = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(ms / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ago`;
  } catch {
    return "recently";
  }
}
