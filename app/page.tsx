import DashboardMap from "../components/map/dashboard-map";
import { db } from "../lib/db/client";
import { issues } from "../lib/db/schema";
import { COPY } from "../lib/constants/copy";
import ScraperHealthPanel from "../components/health/scraper-health-panel";

// Disable static optimization to force fresh SQLite reads on every page request
export const dynamic = "force-dynamic";

export default async function Home() {
  // Query all stored issues from SQLite database
  const allIssues = await db.select().from(issues);
  const failedGeocodeCount = allIssues.filter((item) => item.geocode_status === "failed").length;

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 flex flex-col gap-6">
      {/* Header section */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          {COPY.appTitle}
        </h1>
        <p className="text-sm text-foreground/60">
          Scraped, classified, and geocoded civic infrastructure issues in real-time.
        </p>
      </div>

      {/* Main dashboard content */}
      {allIssues.length === 0 ? (
        <div className="w-full h-[400px] border border-dashed border-border rounded-panel flex flex-col items-center justify-center gap-2 p-6 bg-surface-muted text-center">
          <p className="text-sm font-medium text-foreground/60">{COPY.emptyState}</p>
          <p className="text-xs text-foreground/45 max-w-xs leading-relaxed">
            Run the ingestion script using{" "}
            <code className="bg-surface px-1.5 py-0.5 rounded font-mono border border-border text-foreground/75">
              pnpm ingest
            </code>{" "}
            to populate the map database.
          </p>
        </div>
      ) : (
        <DashboardMap issues={allIssues} />
      )}

      {/* Read-only scraper status drawer overlay */}
      <ScraperHealthPanel failedGeocodeCount={failedGeocodeCount} />
    </main>
  );
}
