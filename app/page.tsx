import DashboardLayout from "../components/dashboard/dashboard-layout";
import ScraperStatusGrid from "../components/health/scraper-status-grid";
import LiveFeedTicker from "../components/dashboard/live-feed-ticker";
import ArchitectureExplainer from "../components/dashboard/architecture-explainer";
import { db } from "../lib/db/client";
import { issues, scraperRuns } from "../lib/db/schema";

export const dynamic = "force-dynamic";

export default async function Home() {
  const allIssues = await db.select().from(issues);
  const allRuns = await db.select().from(scraperRuns);

  const defaultCenterEnv = process.env.DEFAULT_MAP_CENTER;
  const defaultZoomEnv = process.env.DEFAULT_MAP_ZOOM;

  let defaultCenter: [number, number] = [18.5204, 73.8567];
  if (defaultCenterEnv) {
    const parts = defaultCenterEnv.split(",").map(Number);
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      defaultCenter = [parts[0], parts[1]];
    }
  }

  let defaultZoom = 12;
  if (defaultZoomEnv) {
    const z = parseInt(defaultZoomEnv, 10);
    if (!isNaN(z)) defaultZoom = z;
  }

  const geocodedCount = allIssues.filter((i) => i.geocode_status === "ok").length;
  const healthyScrapers = allRuns.filter((r) => r.status === "healthy").length;
  const totalScrapers = allRuns.length;
  const lastUpdated = allRuns.length > 0
    ? allRuns.sort((a, b) => new Date(b.last_run).getTime() - new Date(a.last_run).getTime())[0].last_run
    : null;

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Top Navigation Bar ── */}
      <nav className="sticky top-0 z-50 border-b border-[oklch(28%_0.02_265)] glass">
        <div className="max-w-screen-2xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[oklch(72%_0.19_145)] to-[oklch(60%_0.19_200)] flex items-center justify-center shadow-lg shadow-[oklch(72%_0.19_145)/0.3]">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6.75v6.75" />
              </svg>
            </div>
            <div>
              <span className="text-sm font-bold text-[oklch(94%_0.005_265)] tracking-tight">CivicPulse</span>
              <span className="hidden sm:inline text-sm text-[oklch(60%_0.01_265)] ml-1">Pune</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Live indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[oklch(72%_0.19_145/0.12)] border border-[oklch(72%_0.19_145/0.3)]">
              <span className="pulse-ring w-2 h-2 rounded-full text-[oklch(72%_0.19_145)] bg-[oklch(72%_0.19_145)]"></span>
              <span className="text-[10px] font-bold text-[oklch(72%_0.19_145)] uppercase tracking-widest">Live</span>
            </div>

            {/* Scraper status mini-badge */}
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-[oklch(60%_0.01_265)]">
              <span className="w-2 h-2 rounded-full status-dot-healthy inline-block"></span>
              <span>{healthyScrapers}/{totalScrapers} collectors healthy</span>
            </div>

            {/* Bright Data badge */}
            <a
              href="https://brightdata.com/products/scraping-browser/scraper-studio"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md border border-[oklch(28%_0.02_265)] hover:border-[oklch(36%_0.02_265)] transition-colors text-[10px] font-mono text-[oklch(60%_0.01_265)] hover:text-[oklch(94%_0.005_265)]"
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              Bright Data Scraper Studio
            </a>
          </div>
        </div>
      </nav>

      {/* ── Hero Header ── */}
      <header className="relative overflow-hidden border-b border-[oklch(28%_0.02_265)]">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-[oklch(72%_0.19_145/0.06)] blur-3xl"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-[oklch(67%_0.18_240/0.05)] blur-3xl"></div>
        </div>

        <div className="relative max-w-screen-2xl mx-auto px-6 py-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="animate-fade-up">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-mono font-medium text-[oklch(72%_0.19_145)] uppercase tracking-[0.15em]">Pune Civic Intelligence Platform</span>
                <span className="text-[10px] font-mono text-[oklch(42%_0.01_265)]">·</span>
                <span className="text-[10px] font-mono text-[oklch(42%_0.01_265)]">Powered by Bright Data Scraper Studio</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-[1.05]">
                <span className="gradient-text">CivicPulse</span>
                <span className="text-[oklch(60%_0.01_265)] font-light ml-3 text-3xl sm:text-4xl">Pune</span>
              </h1>
              <p className="mt-3 text-[oklch(60%_0.01_265)] text-sm leading-relaxed max-w-xl">
                Self-healing scrapers continuously monitor{" "}
                <span className="text-[oklch(94%_0.005_265)] font-medium">news sites, citizen portals, and social media</span>{" "}
                — classifying and geocoding every civic complaint across Pune in real time.
              </p>
            </div>

            {/* Stats row */}
            <div className="flex gap-4 flex-wrap animate-fade-up-1">
              <StatPill value={allIssues.length} label="Issues Tracked" color="brand" />
              <StatPill value={geocodedCount} label="Geocoded" color="blue" />
              <StatPill value={`${healthyScrapers}/${totalScrapers}`} label="Scrapers Online" color="healthy" />
              {lastUpdated && <StatPill value="Live" label={`Updated ${formatTimeAgo(lastUpdated)}`} color="live" />}
            </div>
          </div>
        </div>
      </header>

      {/* ── Auto-Scrolling Live Feed Ticker ── */}
      <LiveFeedTicker issues={allIssues} />

      {/* ── Main Content ── */}
      <main className="flex-1 max-w-screen-2xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6">
        {allIssues.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 py-32 text-center animate-fade-up">
            <div className="w-16 h-16 rounded-2xl bg-[oklch(18%_0.01_265)] border border-[oklch(28%_0.02_265)] flex items-center justify-center">
              <svg className="w-8 h-8 text-[oklch(42%_0.01_265)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-[oklch(94%_0.005_265)]">No issues in database</p>
              <p className="text-xs text-[oklch(42%_0.01_265)] mt-1">Run <code className="bg-[oklch(18%_0.01_265)] border border-[oklch(28%_0.02_265)] px-1.5 py-0.5 rounded font-mono text-[oklch(72%_0.19_145)]">pnpm seed</code> to populate demo data</p>
            </div>
          </div>
        ) : (
          <DashboardLayout
            issues={allIssues}
            defaultCenter={defaultCenter}
            defaultZoom={defaultZoom}
          />
        )}

        {/* ── Architecture Explainer Section ── */}
        <div className="animate-fade-up-2">
          <ArchitectureExplainer />
        </div>

        {/* ── Scraper Status Grid ── */}
        <div className="animate-fade-up-3">
          <ScraperStatusGrid runs={allRuns} />
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-[oklch(28%_0.02_265)] py-4 px-6">
        <div className="max-w-screen-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-[oklch(42%_0.01_265)] font-mono">
          <span>CivicPulse Pune · Into the Scrape-Verse Hackathon · WeMakeDevs × Bright Data 2026</span>
          <span>Self-healing scrapers · Gemini AI classification · Nominatim geocoding</span>
        </div>
      </footer>
    </div>
  );
}

function StatPill({ value, label, color }: { value: string | number; label: string; color: string }) {
  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    brand: { bg: "oklch(72%_0.19_145/0.1)", text: "oklch(72%_0.19_145)", border: "oklch(72%_0.19_145/0.3)" },
    blue: { bg: "oklch(67%_0.18_240/0.1)", text: "oklch(67%_0.18_240)", border: "oklch(67%_0.18_240/0.3)" },
    healthy: { bg: "oklch(72%_0.19_145/0.08)", text: "oklch(72%_0.19_145)", border: "oklch(72%_0.19_145/0.25)" },
    live: { bg: "oklch(78%_0.17_75/0.1)", text: "oklch(78%_0.17_75)", border: "oklch(78%_0.17_75/0.3)" },
  };
  const c = colorMap[color] || colorMap.brand;
  return (
    <div
      className="flex flex-col items-center px-4 py-2 rounded-lg border"
      style={{ background: `${c.bg}`, borderColor: c.border }}
    >
      <span className="text-xl font-black" style={{ color: c.text }}>{value}</span>
      <span className="text-[9px] font-mono uppercase tracking-widest" style={{ color: "oklch(60%_0.01_265)" }}>{label}</span>
    </div>
  );
}

function formatTimeAgo(dateStr: string): string {
  try {
    const ms = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(ms / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  } catch {
    return "recently";
  }
}
