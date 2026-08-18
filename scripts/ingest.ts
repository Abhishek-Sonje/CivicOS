import { runCollector } from "../lib/scraper/client";
import { normalizeIssueRaw } from "../lib/scraper/normalize";
import { classifyIssue } from "../lib/ai/classify-issue";
import { geocodeLocation } from "../lib/ai/geocode";
import { db } from "../lib/db/client";
import { issues } from "../lib/db/schema";
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
  const collectorId = process.argv.filter((arg) => arg !== "--mock")[2] || process.env.BRIGHTDATA_COLLECTOR_ID || "c_mock_collector";

  let rawPayloads: any[];

  if (isMockMode) {
    console.log("=========================================");
    console.log("               [MOCK MODE]               ");
    console.log("  Running ingestion with local mock data ");
    console.log("=========================================");
    rawPayloads = MOCK_RECORDS;
  } else {
    console.log(`[START] Starting ingestion pipeline for collector: ${collectorId}`);

    // Retrieve crawl target configuration from the map
    const target = SCRAPER_TARGETS[collectorId];
    if (target === undefined || target === "" || (Array.isArray(target) && target.length === 0)) {
      console.error(
        `[ERROR] No target URL(s) or file path configured for collector "${collectorId}".` +
        ` Please populate the target details inside "lib/scraper/targets.ts".`
      );
      process.exit(1);
    }

    try {
      // Shell out to Bright Data CLI with the target URL/file configuration
      const result = await runCollector(collectorId, target);
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
    } catch (error) {
      console.error(
        `[ERROR] Bright Data CLI execution failed: ${(error as Error).message}`
      );
      process.exit(1);
    }

    if (!rawPayloads || rawPayloads.length === 0) {
      console.error(`[ERROR] Scraper run for "${collectorId}" returned 0 items or null results.`);
      process.exit(1);
    }
  }

  console.log(`[INFO] Found ${rawPayloads.length} raw records to process.`);
  let successCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < rawPayloads.length; i++) {
    const rawRecord = rawPayloads[i];
    const indexStr = `[Record ${i + 1}/${rawPayloads.length}]`;

    try {
      console.log(`\n--- ${indexStr} Processing: "${rawRecord.post_title || "Untitled"}" ---`);

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

      // 4. Geocode with OSM Nominatim
      console.log(`[GEO] Geocoding address: "${normalized.location_text}"...`);
      const coords = await geocodeLocation(normalized.location_text);

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
          `[WARN] Geocoding failed for: "${normalized.location_text}". Inserting record with null coordinates.`
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
        location_text: normalized.location_text,
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

  console.log(`\n[DONE] Ingestion run finished! Success: ${successCount}, Skipped/Duplicates: ${skippedCount}`);
}

runIngestion();
