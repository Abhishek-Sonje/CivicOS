import { runCollector, discoverRssUrls } from "../lib/scraper/client";
import { normalizeIssueRaw } from "../lib/scraper/normalize";
import { classifyIssue } from "../lib/ai/classify-issue";
import { geocodeLocation } from "../lib/ai/geocode";
import { db } from "../lib/db/client";
import { issues, scraperRuns } from "../lib/db/schema";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { SCRAPER_TARGETS } from "../lib/scraper/targets";
import { MOCK_RECORDS } from "./mock-data";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables from .env.local for command-line execution
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function runIngestion() {
  const isMockMode = process.argv.includes("--mock");
  const cliCollectorId = process.argv.filter((arg) => arg !== "--mock")[2];

  let targetCollectors: string[] = [];

  if (isMockMode) {
    targetCollectors = [cliCollectorId || "c_mock_collector"];
  } else {
    if (cliCollectorId) {
      targetCollectors = [cliCollectorId];
    } else if (process.env.BRIGHTDATA_COLLECTOR_ID) {
      targetCollectors = [process.env.BRIGHTDATA_COLLECTOR_ID];
    } else {
      // Loop and execute all verified collectors in SCRAPER_TARGETS (excluding mock)
      targetCollectors = Object.keys(SCRAPER_TARGETS).filter((id) => id !== "c_mock_collector");
    }
  }

  console.log(`[INFO] Scheduled ingestion targets: ${targetCollectors.join(", ")}`);
  let anyCollectorFailed = false;

  for (const collectorId of targetCollectors) {
    let itemsFetched = 0;
    try {
      let rawPayloads: any[];

      if (isMockMode) {
        console.log("=========================================");
        console.log(`         [MOCK MODE: ${collectorId}]     `);
        console.log("  Running ingestion with local mock data ");
        console.log("=========================================");
        rawPayloads = MOCK_RECORDS;
        itemsFetched = rawPayloads.length;
      } else {
        console.log(`\n[START] Starting ingestion pipeline for collector: ${collectorId}`);

        // Retrieve crawl target configuration from the map
        const target = SCRAPER_TARGETS[collectorId];
        if (target === undefined || target === "" || (Array.isArray(target) && target.length === 0)) {
          throw new Error(
            `No target URL(s) or file path configured for collector "${collectorId}".` +
            ` Please populate the target details inside "lib/scraper/targets.ts".`
          );
        }

        let runTarget = target;

        // Handle two-stage scraping flow if the target is a Google News RSS feed
        if (typeof target === "string" && target.includes("news.google.com/rss")) {
          console.log(`[RSS] Resolving search feed items from RSS URL: ${target}`);
          const discoveredUrls = await discoverRssUrls(target);
          console.log(`[RSS] Discovered ${discoveredUrls.length} article links inside XML feed.`);

          if (discoveredUrls.length === 0) {
            throw new Error(`Google News RSS feed returned zero article items.`);
          }

          // Limit feed batch to the first 3 links to keep live demo execute times fast
          const demoBatchUrls = discoveredUrls.slice(0, 3);
          console.log(`[RSS] Batching top ${demoBatchUrls.length} articles to scrape details:`, demoBatchUrls);
          runTarget = demoBatchUrls;
        }

        // Shell out to Bright Data CLI with the target URL/file configuration
        const result = await runCollector(collectorId, runTarget);
        console.log("[INFO] Scraper run completed. Parsing results...");

        // Extracts items flexibly based on what the JSON output contains
        if (Array.isArray(result)) {
          rawPayloads = result;
        } else if (result && Array.isArray(result.results)) {
          rawPayloads = result.results;
        } else if (result && Array.isArray(result.items)) {
          rawPayloads = result.items;
        } else if (result && typeof result === "object") {
          rawPayloads = [result];
        } else {
          rawPayloads = [];
        }

        if (!rawPayloads || rawPayloads.length === 0) {
          throw new Error(`Scraper run for "${collectorId}" returned 0 items or null results.`);
        }

        itemsFetched = rawPayloads.length;
      }

      console.log(`[INFO] Found ${rawPayloads.length} raw records to process.`);
      console.log(
        "[DEBUG] Raw Bright Data record count:",
        rawPayloads.length
      );
      
      let successCount = 0;
      let skippedCount = 0;

      for (let i = 0; i < rawPayloads.length; i++) {
        const rawRecord = rawPayloads[i];
        const indexStr = `[Record ${i + 1}/${rawPayloads.length}]`;

        try {
          console.log(
            `\n--- ${indexStr} Processing: "${
              rawRecord.post_title || rawRecord.article_title || rawRecord.issue_title || "Untitled"
            }" ---`
          );

          // Normalize and validate against IssueRaw schema
          const normalized = normalizeIssueRaw(rawRecord);
          console.log("[OK] Normalization passed.");

          // Check for duplicates in the DB by source URL to maintain idempotency
          const existing = await db
            .select()
            .from(issues)
            .where(eq(issues.source_url, normalized.source_url))
            .limit(1);

          if (existing.length > 0) {
            console.log(`[SKIP] Record already exists in DB (source_url matches). Skipping.`);
            skippedCount++;
            continue;
          }

          // Classify with Gemini
          console.log("[AI] Classifying with Gemini...");
          const classification = await classifyIssue(
            normalized.description_text || normalized.post_title
          );
          console.log(
            `   ↳ Category: "${classification.category}", Severity: ${classification.severity}/5`
          );

          // Determine the best geocoding address: prioritize Gemini's extracted location text from the article body
          const geocodeAddress = classification.location_text || normalized.location_text;

          // 4. Geocode with OSM Nominatim
          console.log(`[GEO] Geocoding address: "${geocodeAddress}"...`);
          const coords = await geocodeLocation(geocodeAddress);

          let lat: number | null = null;
          let lon: number | null = null;
          let geocodeStatus: "ok" | "failed" = "failed";

          if (coords) {
            lat = coords.lat;
            lon = coords.lon;
            geocodeStatus = "ok";
            console.log(`   ↳ Latitude: ${lat}, Longitude: ${lon}`);
          } else {
            console.warn(
              `[WARN] Geocoding failed for: "${geocodeAddress}". Inserting record with null coordinates.`
            );
          }

          // 5. Save to the database
          console.log("[DB] Saving to database...");
          await db.insert(issues).values({
            id: randomUUID(),
            post_title: normalized.post_title,
            description_text: normalized.description_text,
            image_url: normalized.image_url,
            timestamp: normalized.timestamp,
            location_text: geocodeAddress,
            source_url: normalized.source_url,
            category: classification.category,
            severity: classification.severity,
            lat,
            lon,
            geocode_status: geocodeStatus,
          });

          console.log("[OK] Successfully saved.");
          successCount++;
        } catch (err) {
          console.error(
            `[ERROR] Failed to process record: ${(err as Error).message}. Skipping to prevent crash.`
          );
          skippedCount++;
        }
      }

      console.log(`\n[DONE] Ingestion run finished for ${collectorId}! Success: ${successCount}, Skipped/Duplicates: ${skippedCount}`);

      // Log the successful run to scraper_runs table
      console.log(`[DB] Logging run success for ${collectorId} to scraper_runs...`);
      await db.insert(scraperRuns).values({
        id: randomUUID(),
        collector_id: collectorId,
        status: "healthy",
        items_fetched: itemsFetched,
        last_run: new Date().toLocaleString(),
        error_message: null,
      });

    } catch (error) {
      anyCollectorFailed = true;
      const errMsg = (error as Error).message;
      console.error(`\n[ERROR] Ingestion run failed for ${collectorId}: ${errMsg}`);

      // Log the failed run to scraper_runs table
      console.log(`[DB] Logging run failure for ${collectorId} to scraper_runs...`);
      try {
        await db.insert(scraperRuns).values({
          id: randomUUID(),
          collector_id: collectorId,
          status: "failed",
          items_fetched: 0,
          last_run: new Date().toLocaleString(),
          error_message: errMsg,
        });
      } catch (dbErr) {
        console.error("[ERROR] Failed to write failure log to database:", dbErr);
      }
    }
  }

  if (anyCollectorFailed) {
    process.exit(1);
  }
}

runIngestion();
