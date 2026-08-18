import { db } from "../../../lib/db/client";
import { scraperRuns } from "../../../lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// Force on-demand rendering for the health API to fetch fresh SQLite values on every request
export const dynamic = "force-dynamic";

export async function GET() {
  const targetCollectors = [
    "c_msysw2mi1tutw6mudf",
    "c_msytjogw20erpmmgps",
    "c_msyuag5p1o4xpkft2r",
  ];
  const healthData = [];

  for (const collectorId of targetCollectors) {
    try {
      const latestRun = await db
        .select()
        .from(scraperRuns)
        .where(eq(scraperRuns.collector_id, collectorId))
        .orderBy(desc(scraperRuns.last_run))
        .limit(1);

      if (latestRun.length > 0) {
        const run = latestRun[0];
        healthData.push({
          id: run.collector_id,
          status: run.status,
          lastRun: run.last_run,
          itemCount: run.items_fetched,
          errorDetail: run.error_message || undefined,
        });
      } else {
        // Return default "Never run" healthy placeholder status if the db table is empty
        healthData.push({
          id: collectorId,
          status: "healthy" as const,
          lastRun: "Never executed",
          itemCount: 0,
          errorDetail: undefined,
        });
      }
    } catch (error) {
      console.error(`[API Error] Failed to retrieve scraper run for "${collectorId}":`, error);
      healthData.push({
        id: collectorId,
        status: "failed" as const,
        lastRun: "Error querying db",
        itemCount: 0,
        errorDetail: (error as Error).message,
      });
    }
  }

  return NextResponse.json(healthData);
}
